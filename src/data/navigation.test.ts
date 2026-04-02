import { describe, it, expect } from "vitest";
import { navLinks } from "./navigation";

describe("navigation data", () => {
  it("has at least one entry", () => {
    expect(navLinks.length).toBeGreaterThan(0);
  });

  it("all entries have label and href", () => {
    for (const link of navLinks) {
      expect(link.label).toBeTruthy();
      expect(link.href).toBeTruthy();
    }
  });

  it("all hrefs start with #", () => {
    for (const link of navLinks) {
      expect(link.href.startsWith("#")).toBe(true);
    }
  });

  it("first item is Home pointing to #hero", () => {
    expect(navLinks[0].label).toBe("Home");
    expect(navLinks[0].href).toBe("#hero");
  });

  it("last item is Contact pointing to #contact", () => {
    const last = navLinks[navLinks.length - 1];
    expect(last.label).toBe("Contact");
    expect(last.href).toBe("#contact");
  });

  it("has no duplicate labels", () => {
    const labels = navLinks.map((l) => l.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("has no duplicate hrefs", () => {
    const hrefs = navLinks.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
