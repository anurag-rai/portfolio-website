import type { Page } from "@playwright/test";

/** Wait for preloader to finish (or not exist) */
export async function waitForPreloader(page: Page) {
  // Wait for preloader to disappear (removed from DOM after animation)
  await page.waitForFunction(() => !document.getElementById("preloader"), { timeout: 15000 });
}

/** Scroll past the hero to trigger navbar */
export async function scrollPastHero(page: Page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
  await page.waitForTimeout(600); // let ScrollTrigger + animations settle
}

/** Scroll to a section by ID */
export async function scrollToSection(page: Page, sectionId: string) {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView(), sectionId);
  await page.waitForTimeout(600);
}

/** Check if device is mobile-sized (viewport width < 768) */
export async function isMobileViewport(page: Page): Promise<boolean> {
  return page.evaluate(() => window.innerWidth < 768);
}
