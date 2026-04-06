import { test, expect } from "@playwright/test";
import { waitForPreloader, isMobileViewport } from "./helpers";

test.describe("Responsive Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("all sections are present and visible on scroll", async ({ page }) => {
    const sections = ["hero", "about", "experience", "contact"];
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

  // Regression: horizontal swipe on iOS revealed blank black space to the right.
  // Fix: overflow-x: hidden + overscroll-behavior-x: none on html/body,
  // plus overflow-hidden on sections with GSAP slide-in animations.
  test("no horizontal scroll at any scroll position", async ({ page }) => {
    const positions = [
      0, // top
      0.25, // quarter
      0.5, // middle
      0.75, // three quarters
      1, // bottom
    ];

    for (const ratio of positions) {
      await page.evaluate(
        (r) => window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * r),
        ratio,
      );
      await page.waitForTimeout(300);

      const canScrollHorizontally = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(canScrollHorizontally, `horizontal overflow at scroll ratio ${ratio}`).toBe(false);
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
