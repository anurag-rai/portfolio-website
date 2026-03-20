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
    // Scroll to projects
    await scrollToSection(page, "projects");
    await page.waitForTimeout(800);

    // Card should be visible
    const card = page.locator(".project-card").first();
    const opacityAfterScroll = await card.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacityAfterScroll).toBeGreaterThan(0.5);

    // Scroll away (back to hero)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);

    // Card should be hidden/reversed
    const opacityAfterAway = await card.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacityAfterAway).toBeLessThan(0.5);

    // Scroll back to projects
    await scrollToSection(page, "projects");
    await page.waitForTimeout(800);

    // Card should animate back in
    const opacityReplay = await card.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacityReplay).toBeGreaterThan(0.5);
  });
});
