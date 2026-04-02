import { describe, it, expect } from "vitest";
import { projects } from "./projects";

const HTTPS_URL_PATTERN = /^https:\/\/.+/;

describe("projects data", () => {
  it("has at least one entry", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("all entries have required fields", () => {
    for (const project of projects) {
      expect(project.title).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(project.image).toBeTruthy();
      expect(project.technologies).toBeDefined();
    }
  });

  it("image paths start with /", () => {
    for (const project of projects) {
      expect(project.image.startsWith("/")).toBe(true);
    }
  });

  it("liveUrl is a valid https URL when present", () => {
    for (const project of projects) {
      if (project.liveUrl) {
        expect(project.liveUrl).toMatch(HTTPS_URL_PATTERN);
      }
    }
  });

  it("repoUrl is a valid https URL when present", () => {
    for (const project of projects) {
      if (project.repoUrl) {
        expect(project.repoUrl).toMatch(HTTPS_URL_PATTERN);
      }
    }
  });

  it("technologies arrays are non-empty", () => {
    for (const project of projects) {
      expect(project.technologies.length).toBeGreaterThan(0);
      for (const tech of project.technologies) {
        expect(tech.trim()).toBeTruthy();
      }
    }
  });

  it("has no duplicate titles", () => {
    const titles = projects.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
