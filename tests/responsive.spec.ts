import { test, expect } from "@playwright/test";
import { waitForPreloader, isMobileViewport } from "./helpers";

test.describe("Responsive Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("all sections are present and visible on scroll", async ({ page }) => {
    const sections = ["hero", "about", "experience", "projects", "contact"];
    for (const id of sections) {
      const section = page.locator(`#${id}`);
      await expect(section).toBeAttached();
    }
    await expect(page.locator("footer")).toBeAttached();
  });

  test("about section layout adapts to screen size", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    await page.evaluate(() => document.getElementById("about")?.scrollIntoView());
    await page.waitForTimeout(500);

    // On mobile, content should be stacked (single column)
    // On desktop, content should be side-by-side
    // The bio + photo container is the flex div containing the .flex-1 paragraph area
    const aboutContainer = page.locator("#about .flex-1").first().locator("..");
    const direction = await aboutContainer.evaluate((el) => getComputedStyle(el).flexDirection);

    if (mobile) {
      expect(direction).toBe("column");
    } else {
      expect(direction).toBe("row");
    }
  });

  test("desktop nav is hidden on mobile, visible on desktop", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
    await page.waitForTimeout(600);

    const desktopNav = page.locator("header ul");

    if (mobile) {
      await expect(desktopNav).not.toBeVisible();
    } else {
      await expect(desktopNav).toBeVisible();
    }
  });
});
