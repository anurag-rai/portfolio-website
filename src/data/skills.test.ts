import { describe, it, expect } from "vitest";
import { skills } from "./skills";

describe("skills data", () => {
  it("has at least one skill", () => {
    expect(skills.length).toBeGreaterThan(0);
  });

  it("all entries are non-empty strings", () => {
    for (const skill of skills) {
      expect(typeof skill).toBe("string");
      expect(skill.trim()).toBeTruthy();
    }
  });

  it("has no duplicates", () => {
    expect(new Set(skills).size).toBe(skills.length);
  });
});
