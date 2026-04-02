import { describe, it, expect } from "vitest";
import { clock } from "./clock";

describe("clock", () => {
  it("has a timezone property", () => {
    expect(clock).toHaveProperty("timezone");
  });

  it("has a label property", () => {
    expect(clock).toHaveProperty("label");
  });

  it("timezone is a valid IANA timezone string", () => {
    expect(() => {
      Intl.DateTimeFormat(undefined, { timeZone: clock.timezone });
    }).not.toThrow();
  });

  it("label is a non-empty string", () => {
    expect(typeof clock.label).toBe("string");
    expect(clock.label.length).toBeGreaterThan(0);
  });
});
