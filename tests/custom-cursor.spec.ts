import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Custom Cursor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("custom cursor elements exist when pointer:fine, absent on touch devices", async ({
    page,
  }) => {
    await page.waitForTimeout(500);

    // The cursor script checks (pointer: fine) — touch devices (tablets, phones) won't have it
    const hasFineCursor = await page.evaluate(() => window.matchMedia("(pointer: fine)").matches);

    // Count fixed-position elements with pointer-events:none that look like cursor
    const cursorElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("body > div")).filter((el) => {
        const style = getComputedStyle(el);
        return (
          style.position === "fixed" &&
          style.pointerEvents === "none" &&
          style.borderRadius === "50%"
        );
      }).length;
    });

    if (hasFineCursor) {
      expect(cursorElements).toBe(2); // dot + circle
    } else {
      expect(cursorElements).toBe(0);
    }
  });

  test("native cursor is hidden when custom cursor is active", async ({ page }) => {
    const hasFineCursor = await page.evaluate(() => window.matchMedia("(pointer: fine)").matches);
    if (!hasFineCursor) return; // Touch devices don't get custom cursor

    await page.waitForTimeout(500);
    const cursor = await page.evaluate(() => getComputedStyle(document.body).cursor);
    expect(cursor).toBe("none");
  });
});
