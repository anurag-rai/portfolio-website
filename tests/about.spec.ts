import { test, expect } from "@playwright/test";
import { waitForPreloader, scrollToSection } from "./helpers";

test.describe("About Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await scrollToSection(page, "about");
  });

  test("displays section heading", async ({ page }) => {
    const heading = page.locator("#about h2");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("About");
  });

  test("displays bio paragraphs", async ({ page }) => {
    const paragraphs = page.locator("#about p");
    const count = await paragraphs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("displays skill pills", async ({ page }) => {
    await page.waitForTimeout(500); // let stagger animation start
    const pills = page.locator("#about .skill-pill");
    const count = await pills.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Verify some expected skills are present
    const allText = await page.locator("#about").textContent();
    expect(allText).toContain("TypeScript");
    expect(allText).toContain("React");
  });

  test("has photo placeholder", async ({ page }) => {
    // There should be a visual element for the photo/avatar
    const photoArea = page.locator('#about :text("Photo")');
    await expect(photoArea).toBeAttached();
  });
});
