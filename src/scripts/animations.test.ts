// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

interface MockGsap {
  registerPlugin: ReturnType<typeof vi.fn>;
  fromTo: ReturnType<typeof vi.fn>;
}

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as typeof window.matchMedia;
}

describe("animations (motion enabled)", () => {
  let gsap: MockGsap;
  let initScrollAnimations: () => void;
  let splitTextReveal: typeof import("./animations").splitTextReveal;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = "";

    mockMatchMedia(false);

    const gsapModule = await import("gsap");
    gsap = gsapModule.gsap as unknown as MockGsap;

    const mod = await import("./animations");
    initScrollAnimations = mod.initScrollAnimations;
    splitTextReveal = mod.splitTextReveal;

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("splitTextReveal", () => {
    it("splits text into individual character spans", () => {
      document.body.innerHTML = "<p data-split>Hello</p>";
      splitTextReveal("[data-split]");

      const chars = document.querySelectorAll(".char");
      expect(chars.length).toBe(5);
      expect(chars[0].textContent).toBe("H");
      expect(chars[1].textContent).toBe("e");
      expect(chars[2].textContent).toBe("l");
      expect(chars[3].textContent).toBe("l");
      expect(chars[4].textContent).toBe("o");
    });

    it("gives each character span class char, display inline-block, and aria-hidden", () => {
      document.body.innerHTML = "<p data-split>AB</p>";
      splitTextReveal("[data-split]");

      const chars = document.querySelectorAll(".char");
      for (const char of chars) {
        expect(char.className).toBe("char");
        expect((char as HTMLElement).style.display).toBe("inline-block");
        expect(char.getAttribute("aria-hidden")).toBe("true");
      }
    });

    it("wraps each word in a non-breaking span", () => {
      document.body.innerHTML = "<p data-split>Hi There</p>";
      splitTextReveal("[data-split]");

      const el = document.querySelector("[data-split]")!;
      const directChildren = el.children;
      const firstWordWrap = directChildren[0] as HTMLElement;
      expect(firstWordWrap.style.display).toBe("inline-block");
      expect(firstWordWrap.style.whiteSpace).toBe("nowrap");
      expect(firstWordWrap.getAttribute("aria-hidden")).toBe("true");
    });

    it("inserts nbsp character spans between words", () => {
      document.body.innerHTML = "<p data-split>Hello World</p>";
      splitTextReveal("[data-split]");

      const chars = document.querySelectorAll(".char");
      // "Hello" = 5 chars, nbsp = 1, "World" = 5 chars = 11 total
      expect(chars.length).toBe(11);
      // The 6th char (index 5) should be the nbsp space
      expect(chars[5].textContent).toBe("\u00A0");
    });

    it("sets the original text as aria-label on the element", () => {
      document.body.innerHTML = "<p data-split>Hello World</p>";
      splitTextReveal("[data-split]");

      const el = document.querySelector("[data-split]")!;
      expect(el.getAttribute("aria-label")).toBe("Hello World");
    });

    it("clears the original innerHTML before splitting", () => {
      document.body.innerHTML = "<p data-split><em>Bold text</em></p>";
      splitTextReveal("[data-split]");

      // Original <em> should be gone, replaced with char spans
      expect(document.querySelector("em")).toBeNull();
      const chars = document.querySelectorAll(".char");
      expect(chars.length).toBeGreaterThan(0);
    });

    it("calls gsap.fromTo with the character elements", () => {
      document.body.innerHTML = "<p data-split>Hi</p>";
      splitTextReveal("[data-split]");

      expect(gsap.fromTo).toHaveBeenCalledTimes(1);
      const [targets] = gsap.fromTo.mock.calls[0];
      expect(targets.length).toBe(2);
    });

    it("handles multiple elements matching the selector", () => {
      document.body.innerHTML = "<p data-split>AB</p><p data-split>CD</p>";
      splitTextReveal("[data-split]");

      expect(gsap.fromTo).toHaveBeenCalledTimes(2);
      const chars = document.querySelectorAll(".char");
      expect(chars.length).toBe(4);
    });

    it("handles multi-word text with correct total character count", () => {
      document.body.innerHTML = "<p data-split>A B C</p>";
      splitTextReveal("[data-split]");

      // "A" + nbsp + "B" + nbsp + "C" = 5 .char elements
      const chars = document.querySelectorAll(".char");
      expect(chars.length).toBe(5);
    });

    it("uses default stagger from theme when not specified", async () => {
      const { theme } = await import("../config/theme");
      document.body.innerHTML = "<p data-split>Hi</p>";
      splitTextReveal("[data-split]");

      const [, , toVars] = gsap.fromTo.mock.calls[0];
      expect(toVars.stagger).toBe(theme.reveal.splitText.stagger);
    });

    it("passes stagger parameter through to gsap", () => {
      document.body.innerHTML = "<p data-split>Hi</p>";
      splitTextReveal("[data-split]");

      const [, , toVars] = gsap.fromTo.mock.calls[0];
      expect(typeof toVars.stagger).toBe("number");
      expect(toVars.stagger).toBeGreaterThan(0);
    });

    it("does nothing when no elements match the selector", () => {
      document.body.innerHTML = "<p>No match</p>";
      splitTextReveal("[data-split]");

      expect(gsap.fromTo).not.toHaveBeenCalled();
    });
  });

  describe("initScrollAnimations", () => {
    it("calls gsap.fromTo for each data-animate element", () => {
      document.body.innerHTML = "<div data-animate>One</div><div data-animate>Two</div>";
      initScrollAnimations();

      expect(gsap.fromTo).toHaveBeenCalledTimes(2);
    });

    it("passes theme reveal config to gsap.fromTo", async () => {
      const { theme } = await import("../config/theme");
      document.body.innerHTML = "<div data-animate>Test</div>";
      initScrollAnimations();

      const [, fromVars, toVars] = gsap.fromTo.mock.calls[0];
      expect(fromVars.opacity).toBe(0);
      expect(fromVars.y).toBe(theme.reveal.offset);
      expect(toVars.opacity).toBe(1);
      expect(toVars.y).toBe(0);
      expect(toVars.duration).toBe(theme.reveal.duration);
      expect(toVars.ease).toBe(theme.reveal.ease);
    });

    it("does nothing when no data-animate elements exist", () => {
      document.body.innerHTML = "<div>No animation</div>";
      initScrollAnimations();

      expect(gsap.fromTo).not.toHaveBeenCalled();
    });
  });
});

describe("animations (reduced motion)", () => {
  let gsap: MockGsap;
  let initScrollAnimations: () => void;
  let splitTextReveal: typeof import("./animations").splitTextReveal;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = "";

    mockMatchMedia(true);

    const gsapModule = await import("gsap");
    gsap = gsapModule.gsap as unknown as MockGsap;

    const mod = await import("./animations");
    initScrollAnimations = mod.initScrollAnimations;
    splitTextReveal = mod.splitTextReveal;

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("initScrollAnimations is a no-op", () => {
    document.body.innerHTML = "<div data-animate>Test</div>";
    initScrollAnimations();

    expect(gsap.fromTo).not.toHaveBeenCalled();
  });

  it("splitTextReveal is a no-op", () => {
    document.body.innerHTML = "<p data-split>Hello World</p>";
    splitTextReveal("[data-split]");

    expect(gsap.fromTo).not.toHaveBeenCalled();
    // DOM should remain untouched
    expect(document.querySelector("[data-split]")!.textContent).toBe("Hello World");
  });
});
