import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("skip-to-content link is present", async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Verify skip link has correct href
    const href = await skipLink.getAttribute("href");
    expect(href).toBe("#main-content");
  });

  test("skip-to-content link receives focus on Tab (Chromium)", async ({ page, browserName }) => {
    // WebKit does not focus links with Tab by default (Safari system setting)
    test.skip(browserName === "webkit", "WebKit does not Tab-focus links by default");

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    const href = await focused.getAttribute("href");
    expect(href).toBe("#main-content");
  });

  test("page has proper heading hierarchy", async ({ page }) => {
    // Single h1
    const h1s = page.locator("h1");
    const h1Count = await h1s.count();
    expect(h1Count).toBe(1);

    // Multiple h2s (one per section)
    const h2s = page.locator("h2");
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThanOrEqual(3); // About, Experience, Contact
  });

  test("semantic landmarks are present", async ({ page }) => {
    await expect(page.locator("header")).toBeAttached();
    await expect(page.locator("nav")).toBeAttached();
    await expect(page.locator("main")).toBeAttached();
    await expect(page.locator("footer")).toBeAttached();
  });

  test("interactive elements are keyboard focusable (Chromium)", async ({ page, browserName }) => {
    // WebKit does not Tab-focus links without system-level accessibility setting
    test.skip(browserName === "webkit", "WebKit does not Tab-focus links by default");

    // Tab multiple times and verify focus moves
    const focusedElements: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${el.getAttribute("href") || el.id || ""}` : "none";
      });
      focusedElements.push(tag);
    }

    // Should have focused on multiple different elements
    const unique = new Set(focusedElements);
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });

  test("images have alt attributes", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });

  test("external links have noopener", async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
    }
  });
});
