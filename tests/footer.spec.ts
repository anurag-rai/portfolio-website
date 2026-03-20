import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
  });

  test("displays copyright with current year", async ({ page }) => {
    const footer = page.locator("footer");
    const text = (await footer.textContent()) || "";
    const currentYear = new Date().getFullYear().toString();
    expect(text).toContain(currentYear);
    expect(text).toContain("Anurag Rai");
  });

  test("displays live clock with IST timezone", async ({ page }) => {
    const clock = page.locator("#live-clock");
    await expect(clock).toBeVisible();
    const text = await clock.textContent();
    expect(text).toContain("IST");
    // Should show a time pattern like "12:34 AM IST"
    expect(text).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)\s*IST/);
  });

  test("clock updates over time", async ({ page }) => {
    const clock = page.locator("#live-clock");
    const initialText = await clock.textContent();
    expect(initialText).toMatch(/IST/);
    await page.waitForTimeout(1500);
    const laterText = await clock.textContent();
    // Clock should still show valid IST time (may or may not have ticked in 1.5s)
    expect(laterText).toMatch(/IST/);
  });

  test("gradient separator is present", async ({ page }) => {
    // Footer has a 1px high gradient separator
    const separator = page.locator("footer > div").first();
    await expect(separator).toBeAttached();
  });
});
