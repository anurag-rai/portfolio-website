import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Hero Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await page.waitForTimeout(1500); // let hero text animation complete
  });

  test("displays name and subtitle", async ({ page }) => {
    const hero = page.locator("#hero");
    await expect(hero).toBeVisible();

    // Name should be visible (check aria-label since text is split into spans)
    const title = page.locator("#hero-title");
    await expect(title).toBeVisible();
    const titleText = (await title.getAttribute("aria-label")) || (await title.textContent());
    expect(titleText?.replace(/\s+/g, " ").trim()).toContain("ANURAG RAI");

    // Subtitle
    const subtitle = page.locator("#hero-subtitle");
    await expect(subtitle).toBeVisible();
    const subtitleText =
      (await subtitle.getAttribute("aria-label")) || (await subtitle.textContent());
    expect(subtitleText?.toLowerCase()).toContain("software engineer");
  });

  test("hero takes full viewport height", async ({ page }) => {
    const heroHeight = await page
      .locator("#hero")
      .evaluate((el) => el.getBoundingClientRect().height);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    // Allow small tolerance for browser chrome
    expect(heroHeight).toBeGreaterThanOrEqual(viewportHeight - 5);
  });

  test("scroll indicator is visible", async ({ page }) => {
    const indicator = page.locator("#scroll-indicator");
    // Check it has become visible (opacity > 0)
    await expect(indicator).toBeVisible();
  });

  test("3D scene mount is present and canvas renders when WebGL is available", async ({ page }) => {
    const mount = page.locator("#hero-3d-mount");
    await expect(mount).toBeAttached();

    // WebGL may not be available in headless browsers — check and assert accordingly
    const hasWebGL = await page.evaluate(() => {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    });

    if (hasWebGL) {
      const canvas = page.locator("#hero-3d-mount canvas");
      await expect(canvas).toBeAttached({ timeout: 10000 });
    }
  });
});
