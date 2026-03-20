import { test, expect } from "@playwright/test";

test.describe("Preloader", () => {
  test("shows counter with percentage and loading text", async ({ page }) => {
    await page.goto("/");

    const preloader = page.locator("#preloader");
    await expect(preloader).toBeVisible();

    // Counter shows a number
    const counter = page.locator("#preloader-counter");
    const initialText = await counter.textContent();
    const initialValue = Number(initialText);
    expect(initialValue).toBeGreaterThanOrEqual(0);
    expect(initialValue).toBeLessThanOrEqual(100);

    // "%" symbol is visible alongside the counter
    const preloaderText = await preloader.textContent();
    expect(preloaderText).toContain("%");

    // "Loading" text is visible
    expect(preloaderText?.toLowerCase()).toContain("loading");
  });

  test("counter reaches 100 and preloader is removed", async ({ page }) => {
    await page.goto("/");

    // Wait for preloader to finish
    await page.waitForFunction(() => !document.getElementById("preloader"), {
      timeout: 15000,
    });

    // Preloader is gone from DOM
    const preloader = page.locator("#preloader");
    await expect(preloader).not.toBeAttached();
  });

  test("shows on every page load", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => !document.getElementById("preloader"), {
      timeout: 15000,
    });

    // Reload and verify it shows again
    await page.reload();
    const preloader = page.locator("#preloader");
    await expect(preloader).toBeVisible();
    await page.waitForFunction(() => !document.getElementById("preloader"), {
      timeout: 15000,
    });
  });

  test("preloader contains shape visualization", async ({ page }) => {
    await page.goto("/");

    // The SVG shape element should be present
    const shape = page.locator("#preloader-shape");
    await expect(shape).toBeAttached();
  });
});
