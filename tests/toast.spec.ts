import { test, expect } from "@playwright/test";
import { waitForPreloader, scrollToSection } from "./helpers";

test.describe("Toast System", () => {
  test.beforeEach(async ({ page, browserName }) => {
    await page.goto("/");
    await waitForPreloader(page);
    if (browserName === "chromium") {
      await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    }
  });

  test("creates toast container on first toast", async ({ page }) => {
    // Container should not exist before any toast is triggered
    await expect(page.locator("#toast-container")).not.toBeAttached();

    await scrollToSection(page, "contact");
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(500);

    await expect(page.locator("#toast-container")).toBeAttached();
  });

  test("toast is visible with correct text", async ({ page }) => {
    await scrollToSection(page, "contact");
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(500);

    const toast = page.locator("#toast-container > div").first();
    const opacity = await toast.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThanOrEqual(0.9);

    const text = await toast.textContent();
    expect(text?.toLowerCase()).toContain("copied");
  });

  test("toast has expanding ring animation", async ({ page }) => {
    await scrollToSection(page, "contact");
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(700);

    const ring = page.locator("#toast-container [data-ring]").first();
    await expect(ring).toBeAttached();
  });

  test("toast auto-dismisses after hold duration", async ({ page }) => {
    await scrollToSection(page, "contact");
    await page.locator("#copy-email-btn").click();

    // Toast should be visible initially
    await page.waitForTimeout(500);
    expect(await page.locator("#toast-container > div").count()).toBe(1);

    // After hold duration (4s) + fade animation (0.3s) + buffer
    await page.waitForTimeout(4500);
    expect(await page.locator("#toast-container > div").count()).toBe(0);
  });

  test("toasts stack vertically when multiple are triggered", async ({ page }) => {
    await scrollToSection(page, "contact");

    // Trigger first toast
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(500);

    // Trigger second toast (grass) — scroll to bottom and wait for grass canvas to be visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.locator("#footer-grass").click({ force: true });
    await page.waitForTimeout(500);

    const toasts = page.locator("#toast-container > div");
    expect(await toasts.count()).toBe(2);

    // Second toast should be positioned below the first
    const top0 = await toasts.nth(0).evaluate((el) => el.getBoundingClientRect().top);
    const top1 = await toasts.nth(1).evaluate((el) => el.getBoundingClientRect().top);
    expect(top1).toBeGreaterThan(top0);
  });

  test("oldest toast is evicted when max (3) is reached", async ({ page }) => {
    await scrollToSection(page, "contact");

    // Fire 4 toasts rapidly
    for (let i = 0; i < 4; i++) {
      await page.locator("#copy-email-btn").click();
      await page.waitForTimeout(250);
    }
    // Wait for eviction animation to finish
    await page.waitForTimeout(500);

    const count = await page.locator("#toast-container > div").count();
    expect(count).toBeLessThanOrEqual(3);
  });

  test("toasts reposition when one is dismissed", async ({ page }) => {
    await scrollToSection(page, "contact");

    // Fire first toast, wait 2s, then fire second so their timers are staggered
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(2000);
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(400);

    const toasts = page.locator("#toast-container > div");
    expect(await toasts.count()).toBe(2);

    // Record second toast's position while stacked
    const stackedTop = await toasts.nth(1).evaluate((el) => el.getBoundingClientRect().top);

    // Wait for first toast to dismiss (it was fired 2.4s ago, so ~1.9s remaining + 0.3s fade)
    await page.waitForTimeout(2500);

    // Second toast should now be the only one, repositioned to the top
    const remaining = page.locator("#toast-container > div");
    expect(await remaining.count()).toBe(1);

    const newTop = await remaining.first().evaluate((el) => el.getBoundingClientRect().top);
    // It should have moved up from its stacked position
    expect(newTop).toBeLessThan(stackedTop);
  });

  test("toast container has aria-live for screen readers", async ({ page }) => {
    await scrollToSection(page, "contact");
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(500);

    const ariaLive = await page.locator("#toast-container").getAttribute("aria-live");
    expect(ariaLive).toBe("polite");
  });

  test("different toast types show correct content", async ({ page }) => {
    // Email toast
    await scrollToSection(page, "contact");
    await page.locator("#copy-email-btn").click();
    await page.waitForTimeout(400);

    const emailToastText = await page.locator("#toast-container > div").first().textContent();
    expect(emailToastText?.toLowerCase()).toContain("email");

    // Grass toast
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    await page.locator("#footer-grass").click();
    await page.waitForTimeout(400);

    const grassToastText = await page.locator("#toast-container > div").last().textContent();
    expect(grassToastText?.toLowerCase()).toContain("grass");
  });
});
