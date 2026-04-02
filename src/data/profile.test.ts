import { describe, it, expect } from "vitest";
import { profile } from "./profile";

const HTTPS_URL_PATTERN = /^https:\/\/.+/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe("profile data", () => {
  it("has name, title, email, and description", () => {
    expect(profile.name).toBeTruthy();
    expect(profile.title).toBeTruthy();
    expect(profile.email).toBeTruthy();
    expect(profile.description).toBeTruthy();
  });

  it("email has a valid format", () => {
    expect(profile.email).toMatch(EMAIL_PATTERN);
  });

  it("social URLs are valid https URLs", () => {
    expect(profile.social.github).toMatch(HTTPS_URL_PATTERN);
    expect(profile.social.linkedin).toMatch(HTTPS_URL_PATTERN);
  });

  it("bio is a non-empty array of strings", () => {
    expect(profile.bio.length).toBeGreaterThan(0);
    for (const paragraph of profile.bio) {
      expect(typeof paragraph).toBe("string");
      expect(paragraph.trim()).toBeTruthy();
    }
  });
});
