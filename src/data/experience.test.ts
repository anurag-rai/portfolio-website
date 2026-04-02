import { describe, it, expect } from "vitest";
import { experiences } from "./experience";

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

describe("experience data", () => {
  it("has at least one entry", () => {
    expect(experiences.length).toBeGreaterThan(0);
  });

  it("all entries have required fields", () => {
    for (const entry of experiences) {
      expect(entry.role).toBeTruthy();
      expect(entry.company).toBeTruthy();
      expect(entry.startDate).toBeTruthy();
      expect(entry.description).toBeDefined();
      expect(entry.technologies).toBeDefined();
    }
  });

  it("startDate matches YYYY-MM format", () => {
    for (const entry of experiences) {
      expect(entry.startDate).toMatch(DATE_PATTERN);
    }
  });

  it("endDate is null or YYYY-MM format", () => {
    for (const entry of experiences) {
      if (entry.endDate !== null) {
        expect(entry.endDate).toMatch(DATE_PATTERN);
      }
    }
  });

  it("only the first entry has a null endDate (current role)", () => {
    expect(experiences[0].endDate).toBeNull();
    for (const entry of experiences.slice(1)) {
      expect(entry.endDate).not.toBeNull();
    }
  });

  it("startDate comes before endDate chronologically", () => {
    for (const entry of experiences) {
      if (entry.endDate !== null) {
        expect(entry.startDate < entry.endDate).toBe(true);
      }
    }
  });

  it("entries are in reverse chronological order by startDate", () => {
    for (let i = 0; i < experiences.length - 1; i++) {
      expect(experiences[i].startDate > experiences[i + 1].startDate).toBe(true);
    }
  });

  it("description arrays are non-empty", () => {
    for (const entry of experiences) {
      expect(entry.description.length).toBeGreaterThan(0);
      for (const bullet of entry.description) {
        expect(bullet.trim()).toBeTruthy();
      }
    }
  });

  it("technologies arrays are non-empty", () => {
    for (const entry of experiences) {
      expect(entry.technologies.length).toBeGreaterThan(0);
      for (const tech of entry.technologies) {
        expect(tech.trim()).toBeTruthy();
      }
    }
  });

  it("has no duplicate company + role combinations", () => {
    const keys = experiences.map((e) => `${e.company}::${e.role}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
