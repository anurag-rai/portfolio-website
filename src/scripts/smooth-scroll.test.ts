// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockLenisInstance = {
  raf: vi.fn(),
  on: vi.fn(),
  scrollTo: vi.fn(),
};

vi.mock("lenis", () => {
  const MockLenis = vi.fn().mockImplementation(function () {
    return mockLenisInstance;
  });
  return { default: MockLenis };
});
vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    ticker: {
      add: vi.fn(),
      lagSmoothing: vi.fn(),
    },
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { update: vi.fn() },
}));

describe("smooth-scroll (motion enabled)", () => {
  let initSmoothScroll: typeof import("./smooth-scroll").initSmoothScroll;
  let scrollTo: typeof import("./smooth-scroll").scrollTo;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia;

    const mod = await import("./smooth-scroll");
    initSmoothScroll = mod.initSmoothScroll;
    scrollTo = mod.scrollTo;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a Lenis instance", () => {
    const result = initSmoothScroll();

    expect(result).not.toBeNull();
  });

  it("creates Lenis with theme config values", async () => {
    const Lenis = (await import("lenis")).default;
    const { theme } = await import("../config/theme");
    initSmoothScroll();

    expect(Lenis).toHaveBeenCalledWith({
      duration: theme.scroll.duration,
      easing: theme.scroll.easing,
      touchMultiplier: theme.scroll.touchMultiplier,
    });
  });

  it("syncs Lenis with gsap ticker", async () => {
    const { gsap } = await import("gsap");
    initSmoothScroll();

    expect(gsap.ticker.add).toHaveBeenCalledTimes(1);
    expect(gsap.ticker.lagSmoothing).toHaveBeenCalledWith(0);
  });

  it("ticker callback calls Lenis raf with time in ms", async () => {
    const { gsap } = await import("gsap");
    initSmoothScroll();

    const tickerCallback = (gsap.ticker.add as ReturnType<typeof vi.fn>).mock.calls[0][0];
    tickerCallback(1.5);

    expect(mockLenisInstance.raf).toHaveBeenCalledWith(1500);
  });

  it("registers Lenis scroll event for ScrollTrigger update", () => {
    initSmoothScroll();

    expect(mockLenisInstance.on).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("scrollTo uses Lenis scrollTo when available", () => {
    initSmoothScroll();
    scrollTo("#about");

    expect(mockLenisInstance.scrollTo).toHaveBeenCalledWith("#about", { duration: 1.5 });
  });
});

describe("smooth-scroll (reduced motion)", () => {
  let initSmoothScroll: typeof import("./smooth-scroll").initSmoothScroll;
  let scrollTo: typeof import("./smooth-scroll").scrollTo;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia;

    const mod = await import("./smooth-scroll");
    initSmoothScroll = mod.initSmoothScroll;
    scrollTo = mod.scrollTo;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("returns null", () => {
    const result = initSmoothScroll();

    expect(result).toBeNull();
  });

  it("does not create a Lenis instance", async () => {
    const Lenis = (await import("lenis")).default;
    initSmoothScroll();

    expect(Lenis).not.toHaveBeenCalled();
  });

  it("scrollTo falls back to native scrollIntoView", () => {
    const section = document.createElement("section");
    section.id = "contact";
    document.body.appendChild(section);
    const scrollIntoViewSpy = vi.fn();
    section.scrollIntoView = scrollIntoViewSpy;

    initSmoothScroll();
    scrollTo("#contact");

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("scrollTo does nothing when target element does not exist", () => {
    initSmoothScroll();
    // Should not throw
    expect(() => scrollTo("#nonexistent")).not.toThrow();
  });
});
