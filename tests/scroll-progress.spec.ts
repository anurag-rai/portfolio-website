import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Scroll Progress Bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("progress bar is at 0% width at top", async ({ page }) => {
    const bar = page.locator("#scroll-progress");
    await expect(bar).toBeAttached();
    const width = await bar.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThan(50); // near 0
  });

  test("progress bar grows when scrolling down", async ({ page }) => {
    const bar = page.locator("#scroll-progress");

    // Scroll to middle
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    const midWidth = await bar.evaluate((el) => el.getBoundingClientRect().width);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const fullWidth = await bar.evaluate((el) => el.getBoundingClientRect().width);

    expect(fullWidth).toBeGreaterThan(midWidth);
    // At bottom, should be near full viewport width
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(fullWidth).toBeGreaterThan(viewportWidth * 0.8);
  });
});
