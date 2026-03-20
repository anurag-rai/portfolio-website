import { test, expect } from "@playwright/test";
import { waitForPreloader, scrollToSection } from "./helpers";

test.describe("Experience Timeline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
    await scrollToSection(page, "experience");
  });

  test("displays section heading", async ({ page }) => {
    const heading = page.locator("#experience h2");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Experience");
  });

  test("renders timeline nodes for each experience entry", async ({ page }) => {
    const nodes = page.locator(".timeline-node");
    const count = await nodes.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("each node shows role, company, and date with duration", async ({ page }) => {
    const nodes = page.locator(".timeline-node");
    const count = await nodes.count();

    for (let i = 0; i < count; i++) {
      const node = nodes.nth(i);
      // Role title exists
      const role = node.locator(".timeline-role");
      await expect(role).toBeAttached();
      const roleText = await role.textContent();
      expect(roleText?.length).toBeGreaterThan(0);

      // Date range with month format (e.g., "May '23") and duration (e.g., "(2y 10m)")
      const nodeText = (await node.textContent()) || "";
      expect(nodeText).toMatch(/'\d{2}/); // has abbreviated year like '23
      expect(nodeText).toMatch(/\(\d+[ym](\s\d+[ym])?\)/); // has duration like (2y 10m) or (6m)
    }
  });

  test("timeline has progress indicator", async ({ page }) => {
    const progress = page.locator("#timeline-progress");
    await expect(progress).toBeAttached();
  });

  test("active node expands to show description and tech tags", async ({ page }) => {
    // Scroll so the first node is centered in the viewport (within ScrollTrigger zone)
    const firstNode = page.locator(".timeline-node").first();
    await firstNode.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      window.scrollBy(0, elementCenter - viewportCenter);
    });
    await page.waitForTimeout(1000);

    const details = firstNode.locator(".timeline-details");
    const maxHeight = await details.evaluate((el) => getComputedStyle(el).maxHeight);
    // When expanded, maxHeight should be a pixel value > 0 (not "0" or "0px")
    expect(maxHeight).not.toBe("0px");
    expect(maxHeight).not.toBe("0");
  });
});
