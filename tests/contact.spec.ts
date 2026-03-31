import { test, expect } from "@playwright/test";
import { waitForPreloader, scrollToSection } from "./helpers";

test.describe("Contact Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await scrollToSection(page, "contact");
  });

  test("displays heading and description", async ({ page }) => {
    const heading = page.locator("#contact h2");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Connect");

    const description = page.locator("#contact p").first();
    await expect(description).toBeVisible();
  });

  test("Get In Touch button copies email to clipboard (Chromium)", async ({
    page,
    browserName,
  }) => {
    // Clipboard permissions API is Chromium-only
    test.skip(browserName !== "chromium", "Clipboard grantPermissions only works on Chromium");

    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    const btn = page.locator("#copy-email-btn");
    await expect(btn).toBeVisible();
    await btn.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toMatch(/@/); // contains an email address
  });

  test("toast appears after clicking Get In Touch", async ({ page, browserName }) => {
    // Grant clipboard permissions on Chromium so the click handler succeeds cleanly
    if (browserName === "chromium") {
      await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    const btn = page.locator("#copy-email-btn");
    await btn.click();
    await page.waitForTimeout(800);

    const container = page.locator("#toast-container");
    await expect(container).toBeAttached();

    const toastText = await container.textContent();
    expect(toastText?.toLowerCase()).toContain("copied");
  });

  test("toast auto-dismisses", async ({ page, browserName }) => {
    if (browserName === "chromium") {
      await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.locator("#copy-email-btn").click();
    // Wait for auto-dismiss (4s hold + 0.3s fade)
    await page.waitForTimeout(5000);

    const toasts = page.locator("#toast-container > div");
    const count = await toasts.count();
    expect(count).toBe(0);
  });

  test("social icons are present with accessible labels", async ({ page }) => {
    const socialLinks = page.locator("#contact a[aria-label], #contact button[aria-label]");
    const count = await socialLinks.count();
    expect(count).toBeGreaterThanOrEqual(3); // GitHub, LinkedIn, Email

    // Each has an aria-label
    for (let i = 0; i < count; i++) {
      const label = await socialLinks.nth(i).getAttribute("aria-label");
      expect(label?.length).toBeGreaterThan(0);
    }
  });

  test("social links have SVG icons (not text placeholders)", async ({ page }) => {
    const icons = page.locator("#contact svg");
    const count = await icons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
