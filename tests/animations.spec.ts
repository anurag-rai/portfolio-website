import { test, expect } from "@playwright/test";
import { waitForPreloader, scrollToSection } from "./helpers";

test.describe("Scroll Animations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("elements animate in when scrolled to", async ({ page }) => {
    // Scroll to about section
    await scrollToSection(page, "about");
    await page.waitForTimeout(800);

    // Heading should be visible (opacity ~1)
    const heading = page.locator("#about h2");
    const opacity = await heading.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.5);
  });

  test("animations replay when scrolling back and forth", async ({ page }) => {
    const cardSelector = ".project-card";

    // Scroll to projects — wait for card to become visible
    await scrollToSection(page, "projects");
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && Number(getComputedStyle(el).opacity) > 0.5;
      },
      cardSelector,
      { timeout: 5000 },
    );

    // Scroll away (back to hero) — wait for card to fade out
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && Number(getComputedStyle(el).opacity) < 0.5;
      },
      cardSelector,
      { timeout: 5000 },
    );

    // Scroll back to projects — wait for card to animate back in
    await scrollToSection(page, "projects");
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && Number(getComputedStyle(el).opacity) > 0.5;
      },
      cardSelector,
      { timeout: 5000 },
    );
  });
});
