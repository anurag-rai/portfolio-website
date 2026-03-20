import { test, expect } from "@playwright/test";

test.describe("Preloader", () => {
  test("shows counter and completes", async ({ page }) => {
    await page.goto("/");

    // Preloader should be in the DOM
    const preloader = page.locator("#preloader");
    await expect(preloader).toBeVisible();

    // Counter should show a numeric value (starts at 0, may have incremented by read time)
    const counter = page.locator("#preloader-counter");
    const initialText = await counter.textContent();
    const initialValue = Number(initialText);
    expect(initialValue).toBeGreaterThanOrEqual(0);
    expect(initialValue).toBeLessThanOrEqual(100);

    // Wait for it to finish and be removed
    await page.waitForFunction(() => !document.getElementById("preloader"), { timeout: 15000 });

    // Preloader is gone
    await expect(preloader).not.toBeAttached();
  });

  test("shows on every page load", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => !document.getElementById("preloader"), { timeout: 15000 });

    // Reload
    await page.reload();
    const preloader = page.locator("#preloader");
    await expect(preloader).toBeVisible();
    await page.waitForFunction(() => !document.getElementById("preloader"), { timeout: 15000 });
  });
});
