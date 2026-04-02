// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { theme } from "../config/theme";

describe("initCustomCursor", () => {
  let initCustomCursor: typeof import("./cursor").initCustomCursor;
  let matchMediaMock: ReturnType<typeof vi.fn>;

  function setupMatchMedia(pointer: boolean, reducedMotion: boolean) {
    matchMediaMock = vi.fn().mockImplementation((query: string) => {
      if (query === "(pointer: fine)") return { matches: pointer };
      if (query === "(prefers-reduced-motion: reduce)") return { matches: reducedMotion };
      return { matches: false };
    });
    window.matchMedia = matchMediaMock as typeof window.matchMedia;
  }

  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.cursor = "";
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe("when pointer is not fine", () => {
    beforeEach(async () => {
      vi.resetModules();
      setupMatchMedia(false, false);
      const mod = await import("./cursor");
      initCustomCursor = mod.initCustomCursor;
    });

    it("returns early without creating cursor elements", () => {
      initCustomCursor();

      const divs = document.body.querySelectorAll("div");
      expect(divs.length).toBe(0);
    });

    it("does not set body cursor to none", () => {
      initCustomCursor();

      expect(document.body.style.cursor).not.toBe("none");
    });
  });

  describe("when reduced motion is preferred", () => {
    beforeEach(async () => {
      vi.resetModules();
      setupMatchMedia(true, true);
      const mod = await import("./cursor");
      initCustomCursor = mod.initCustomCursor;
    });

    it("returns early without creating cursor elements", () => {
      initCustomCursor();

      const divs = document.body.querySelectorAll("div");
      expect(divs.length).toBe(0);
    });
  });

  describe("when conditions are met (fine pointer, no reduced motion)", () => {
    beforeEach(async () => {
      vi.resetModules();
      setupMatchMedia(true, false);
      const mod = await import("./cursor");
      initCustomCursor = mod.initCustomCursor;
    });

    it("creates dot and circle elements in body", () => {
      initCustomCursor();

      const divs = document.body.querySelectorAll("div");
      expect(divs.length).toBe(2);
    });

    it("dot has correct size from theme", () => {
      initCustomCursor();

      const dot = document.body.querySelector("div") as HTMLElement;
      expect(dot.style.cssText).toContain(`width: ${theme.cursor.dotSize}px`);
      expect(dot.style.cssText).toContain(`height: ${theme.cursor.dotSize}px`);
    });

    it("circle has correct size from theme", () => {
      initCustomCursor();

      const divs = document.body.querySelectorAll("div");
      const circle = divs[1] as HTMLElement;
      expect(circle.style.cssText).toContain(`width: ${theme.cursor.circleSize}px`);
      expect(circle.style.cssText).toContain(`height: ${theme.cursor.circleSize}px`);
    });

    it("dot has pointer-events none and fixed positioning", () => {
      initCustomCursor();

      const dot = document.body.querySelector("div") as HTMLElement;
      expect(dot.style.cssText).toContain("pointer-events: none");
      expect(dot.style.cssText).toContain("position: fixed");
    });

    it("circle has a border style", () => {
      initCustomCursor();

      const divs = document.body.querySelectorAll("div");
      const circle = divs[1] as HTMLElement;
      expect(circle.style.borderRadius).toBe("50%");
      expect(circle.style.cssText).toContain("1px solid");
    });

    it("sets body cursor to none", () => {
      initCustomCursor();

      expect(document.body.style.cursor).toBe("none");
    });

    it("updates dot position on mousemove", () => {
      initCustomCursor();

      const dot = document.body.querySelector("div") as HTMLElement;
      const event = new MouseEvent("mousemove", { clientX: 200, clientY: 300 });
      document.dispatchEvent(event);

      expect(dot.style.left).toBe("200px");
      expect(dot.style.top).toBe("300px");
    });

    it("updates dot position on subsequent mousemove events", () => {
      initCustomCursor();

      const dot = document.body.querySelector("div") as HTMLElement;

      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 100, clientY: 150 }));
      expect(dot.style.left).toBe("100px");
      expect(dot.style.top).toBe("150px");

      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 400, clientY: 500 }));
      expect(dot.style.left).toBe("400px");
      expect(dot.style.top).toBe("500px");
    });

    it("scales up on mouseover of interactive elements", () => {
      initCustomCursor();

      const link = document.createElement("a");
      link.href = "#";
      document.body.appendChild(link);

      const dot = document.body.querySelectorAll("div")[0] as HTMLElement;
      const circle = document.body.querySelectorAll("div")[1] as HTMLElement;

      const event = new MouseEvent("mouseover", { bubbles: true });
      link.dispatchEvent(event);

      expect(dot.style.transform).toContain(`scale(${theme.cursor.hoverScale})`);
      expect(circle.style.transform).toContain(`scale(${theme.cursor.hoverScale})`);
      expect(circle.style.background).toBe("rgba(203, 153, 126, 0.1)");
    });

    it("resets scale on mouseout of interactive elements", () => {
      initCustomCursor();

      const link = document.createElement("a");
      link.href = "#";
      document.body.appendChild(link);

      const dot = document.body.querySelectorAll("div")[0] as HTMLElement;
      const circle = document.body.querySelectorAll("div")[1] as HTMLElement;

      link.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      link.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));

      expect(dot.style.transform).toBe("translate(-50%, -50%) scale(1)");
      expect(circle.style.transform).toBe("translate(-50%, -50%) scale(1)");
      expect(circle.style.background).toBe("transparent");
    });

    it("does not scale on mouseover of non-interactive elements", () => {
      initCustomCursor();

      const span = document.createElement("span");
      document.body.appendChild(span);

      const dot = document.body.querySelectorAll("div")[0] as HTMLElement;

      span.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

      expect(dot.style.transform).not.toContain(`scale(${theme.cursor.hoverScale})`);
    });
  });
});
