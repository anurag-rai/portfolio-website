import { test, expect } from "@playwright/test";
import { waitForPreloader, scrollToSection } from "./helpers";

test.describe("Projects Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await scrollToSection(page, "projects");
  });

  test("displays section heading", async ({ page }) => {
    const heading = page.locator("#projects h2");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Projects");
  });

  test("renders project cards", async ({ page }) => {
    const cards = page.locator(".project-card");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("each project card has title, description, and tech tags", async ({ page }) => {
    const cards = page.locator(".project-card");
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      // Title
      const title = card.locator("h3");
      await expect(title).toBeAttached();
      const titleText = await title.textContent();
      expect(titleText?.length).toBeGreaterThan(0);

      // Description
      const desc = card.locator("p").first();
      await expect(desc).toBeAttached();

      // Tech tags
      const tags = card.locator("span");
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThanOrEqual(1);
    }
  });

  test("project links open in new tab", async ({ page }) => {
    const externalLinks = page.locator('.project-card a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify rel="noopener noreferrer" for security
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
    }
  });
});
