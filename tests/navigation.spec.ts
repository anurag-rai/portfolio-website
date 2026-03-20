import { test, expect } from "@playwright/test";
import { waitForPreloader, scrollPastHero, isMobileViewport } from "./helpers";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("navbar is hidden at top of page", async ({ page }) => {
    const navbar = page.locator("#navbar");
    const opacity = await navbar.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeLessThan(0.5);
  });

  test("navbar appears after scrolling past hero", async ({ page }) => {
    await scrollPastHero(page);
    const navbar = page.locator("#navbar");
    const opacity = await navbar.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThanOrEqual(0.9);
  });

  test("navbar hides when scrolling back to top", async ({ page }) => {
    await scrollPastHero(page);
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const navbar = page.locator("#navbar");
    const opacity = await navbar.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeLessThan(0.5);
  });

  test("nav links scroll to correct sections", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    if (mobile) return; // Tested separately for mobile

    await scrollPastHero(page);

    const sections = ["about", "experience", "projects", "contact"];
    for (const section of sections) {
      const link = page
        .locator(`header a:has-text("${section}")`, { hasText: new RegExp(section, "i") })
        .first();
      await link.click();
      // Wait for smooth scroll to settle — poll until scroll position stabilizes
      await page.waitForFunction(
        () => {
          return new Promise<boolean>((resolve) => {
            const lastY = window.scrollY;
            setTimeout(() => {
              if (window.scrollY === lastY && lastY > 0) resolve(true);
              else resolve(false);
            }, 500);
          });
        },
        undefined,
        { timeout: 8000 },
      );

      const sectionEl = page.locator(`#${section}`);
      const rect = await sectionEl.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top };
      });
      // Section should be visible in the upper half of the viewport after navigation
      // Lenis smooth scroll + WebKit may not align sections pixel-perfectly to the top
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      expect(rect.top).toBeLessThan(viewportHeight / 2);
    }
  });

  test("Home link scrolls back to hero", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    if (mobile) return;

    await scrollPastHero(page);
    // Scroll further down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(600);

    const homeLink = page.locator('header a:has-text("Home")').first();
    await homeLink.click();
    await page.waitForTimeout(1000);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });
});

test.describe("Mobile Menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await scrollPastHero(page);
  });

  test("hamburger visible on mobile, hidden on desktop", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    const hamburger = page.locator("#menu-toggle");

    if (mobile) {
      await expect(hamburger).toBeVisible();
    } else {
      await expect(hamburger).not.toBeVisible();
    }
  });

  test("hamburger opens and closes mobile menu", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    if (!mobile) return;

    const hamburger = page.locator("#menu-toggle");
    const menu = page.locator("#mobile-menu");

    // Open
    await hamburger.click();
    await page.waitForTimeout(500);
    const openOpacity = await menu.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(openOpacity)).toBeGreaterThanOrEqual(0.9);

    // Close — hamburger is behind the overlay (z-index layering), use force to bypass
    await hamburger.click({ force: true });
    await page.waitForTimeout(500);
    const closedOpacity = await menu.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(closedOpacity)).toBeLessThan(0.5);
  });

  test("escape key closes mobile menu", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    if (!mobile) return;

    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    const menu = page.locator("#mobile-menu");
    const opacity = await menu.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeLessThan(0.5);
  });

  test("mobile menu link navigates and closes menu", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    if (!mobile) return;

    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(500);

    const aboutLink = page.locator('#mobile-menu a:has-text("About")');
    await aboutLink.click();
    await page.waitForTimeout(1000);

    // Menu should be closed
    const menu = page.locator("#mobile-menu");
    const opacity = await menu.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeLessThan(0.5);

    // Should have scrolled to about section
    const aboutRect = await page.locator("#about").evaluate((el) => el.getBoundingClientRect().top);
    expect(aboutRect).toBeLessThan(200);
  });

  test("body scroll is locked while mobile menu is open", async ({ page }) => {
    const mobile = await isMobileViewport(page);
    if (!mobile) return;

    await page.locator("#menu-toggle").click();
    await page.waitForTimeout(500);

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe("hidden");

    // Close and verify scroll restored
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    const overflowAfter = await page.evaluate(() => document.body.style.overflow);
    expect(overflowAfter).toBe("");
  });
});
