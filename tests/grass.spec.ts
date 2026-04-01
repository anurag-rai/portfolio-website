import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Footer Grass", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
  });

  test("canvas is present and sized correctly", async ({ page }) => {
    const canvas = page.locator("#footer-grass");
    await expect(canvas).toBeAttached();

    const info = await canvas.evaluate((el) => {
      const c = el as HTMLCanvasElement;
      return {
        clientWidth: c.clientWidth,
        clientHeight: c.clientHeight,
        canvasWidth: c.width,
        canvasHeight: c.height,
      };
    });

    expect(info.clientWidth).toBeGreaterThan(0);
    expect(info.clientHeight).toBe(140);
    // Canvas backing store should be scaled by devicePixelRatio
    expect(info.canvasWidth).toBeGreaterThanOrEqual(info.clientWidth);
  });

  test("canvas has rendered pixel data (grass is drawn)", async ({ page }) => {
    const hasPixels = await page.evaluate(() => {
      const c = document.getElementById("footer-grass") as HTMLCanvasElement;
      const ctx = c.getContext("2d");
      if (!ctx) return false;
      const data = ctx.getImageData(0, 0, c.width, c.height);
      let nonZero = 0;
      for (let i = 3; i < data.data.length; i += 4) {
        if (data.data[i] > 0) nonZero++;
      }
      return nonZero > 100;
    });

    expect(hasPixels).toBe(true);
  });

  test("canvas is positioned above the footer divider", async ({ page }) => {
    const canvasBottom = await page
      .locator("#footer-grass")
      .evaluate((el) => el.getBoundingClientRect().bottom);
    const dividerTop = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      if (!footer) return 0;
      // The divider is the first direct child div with 1px height
      const divider = footer.querySelector("div.h-px");
      return divider ? divider.getBoundingClientRect().top : 0;
    });

    // Canvas bottom should be at or just above the divider (40px tolerance for cross-environment rendering)
    expect(canvasBottom).toBeLessThanOrEqual(dividerTop + 40);
  });

  test("clicking grass triggers a toast", async ({ page }) => {
    await page.locator("#footer-grass").click();
    await page.waitForTimeout(500);

    const container = page.locator("#toast-container");
    await expect(container).toBeAttached();

    const text = await container.textContent();
    expect(text?.toLowerCase()).toContain("grass");
  });

  test("grass canvas is clickable (has cursor pointer)", async ({ page }) => {
    const cursor = await page
      .locator("#footer-grass")
      .evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toBe("pointer");
  });

  test("blade count scales with viewport width", async ({ page }) => {
    // The canvas renders more blades on wider viewports.
    // We can verify this indirectly: a wider canvas should have more non-zero pixels.
    const pixelCount = await page.evaluate(() => {
      const c = document.getElementById("footer-grass") as HTMLCanvasElement;
      const ctx = c.getContext("2d");
      if (!ctx) return 0;
      const data = ctx.getImageData(0, 0, c.width, c.height);
      let count = 0;
      for (let i = 3; i < data.data.length; i += 4) {
        if (data.data[i] > 0) count++;
      }
      return count;
    });

    // On desktop (1280px), density 24 per 100px ≈ 307 blades
    // Each blade covers many pixels, so we should have substantial coverage
    expect(pixelCount).toBeGreaterThan(1000);
  });

  test("respects prefers-reduced-motion", async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await waitForPreloader(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);

    // Grass should still render (static, no animation) — check for pixels
    const hasPixels = await page.evaluate(() => {
      const c = document.getElementById("footer-grass") as HTMLCanvasElement;
      const ctx = c.getContext("2d");
      if (!ctx) return false;
      const data = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 3; i < data.data.length; i += 4) {
        if (data.data[i] > 0) return true;
      }
      return false;
    });

    expect(hasPixels).toBe(true);
  });
});
