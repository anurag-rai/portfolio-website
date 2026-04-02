// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { theme } from "../config/theme";

const config = theme.grass;

function createMockCanvas(width: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  Object.defineProperty(canvas, "clientWidth", {
    value: width,
    configurable: true,
  });

  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: "",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.spyOn(canvas, "getContext").mockImplementation((() => ctx) as any);
  return canvas;
}

function getCtx(canvas: HTMLCanvasElement) {
  return canvas.getContext("2d") as unknown as Record<string, ReturnType<typeof vi.fn> | string>;
}

describe("initGrass", () => {
  let rafCallbacks: Array<(time: number) => void>;
  let rafIdCounter: number;
  let matchMediaResult: { matches: boolean };

  beforeEach(() => {
    rafCallbacks = [];
    rafIdCounter = 0;
    matchMediaResult = { matches: false };

    vi.stubGlobal("devicePixelRatio", 2);

    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: (time: number) => void) => {
        rafCallbacks.push(cb);
        return ++rafIdCounter;
      }),
    );

    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => matchMediaResult),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns early if canvas.getContext returns null", async () => {
    const canvas = document.createElement("canvas");
    vi.spyOn(canvas, "getContext").mockReturnValue(null);

    const { initGrass } = await import("./grass");
    initGrass(canvas);

    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("sets canvas dimensions based on clientWidth and config.canvasHeight", async () => {
    const canvas = createMockCanvas(800);
    const dpr = window.devicePixelRatio;

    const { initGrass } = await import("./grass");
    initGrass(canvas);

    expect(canvas.width).toBe(800 * dpr);
    expect(canvas.height).toBe(config.canvasHeight * dpr);
    expect(canvas.style.height).toBe(`${config.canvasHeight}px`);
  });

  it("calls ctx.scale with devicePixelRatio", async () => {
    const canvas = createMockCanvas(600);
    const dpr = window.devicePixelRatio;

    const { initGrass } = await import("./grass");
    initGrass(canvas);

    const ctx = getCtx(canvas);
    expect(ctx.scale).toHaveBeenCalledWith(dpr, dpr);
  });

  describe("reduced motion", () => {
    beforeEach(() => {
      matchMediaResult.matches = true;
    });

    it("draws blades once and does not call requestAnimationFrame", async () => {
      const canvas = createMockCanvas(400);
      const expectedBladeCount = Math.round((400 / 100) * config.bladeDensity);

      const { initGrass } = await import("./grass");
      initGrass(canvas);

      const ctx = getCtx(canvas);
      expect(ctx.fill).toHaveBeenCalledTimes(expectedBladeCount);
      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe("normal motion", () => {
    it("calls requestAnimationFrame for animation loop", async () => {
      const canvas = createMockCanvas(500);

      const { initGrass } = await import("./grass");
      initGrass(canvas);

      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it("draws blades each animation frame", async () => {
      const canvas = createMockCanvas(500);
      const expectedBladeCount = Math.round((500 / 100) * config.bladeDensity);

      const { initGrass } = await import("./grass");
      initGrass(canvas);

      const ctx = getCtx(canvas);

      // Trigger the first animation frame
      const frameCallback = rafCallbacks[0];
      frameCallback(16);

      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalledTimes(expectedBladeCount);
    });
  });

  it("blade count scales with canvas width", async () => {
    const narrowCount = Math.round((200 / 100) * config.bladeDensity);
    const wideCount = Math.round((1000 / 100) * config.bladeDensity);

    expect(wideCount).toBeGreaterThan(narrowCount);

    // Verify actual rendering matches by counting fill calls in reduced motion
    matchMediaResult.matches = true;

    const narrowCanvas = createMockCanvas(200);
    const { initGrass: initNarrow } = await import("./grass");
    initNarrow(narrowCanvas);

    const narrowFills = (getCtx(narrowCanvas).fill as ReturnType<typeof vi.fn>).mock.calls.length;

    const wideCanvas = createMockCanvas(1000);
    const { initGrass: initWide } = await import("./grass");
    initWide(wideCanvas);

    const wideFills = (getCtx(wideCanvas).fill as ReturnType<typeof vi.fn>).mock.calls.length;

    expect(wideFills).toBeGreaterThan(narrowFills);
    expect(narrowFills).toBe(narrowCount);
    expect(wideFills).toBe(wideCount);
  });

  describe("resize", () => {
    it("regenerates blades for new width", async () => {
      const canvas = createMockCanvas(600);

      const { initGrass } = await import("./grass");
      initGrass(canvas);

      const ctx = getCtx(canvas);
      const dpr = window.devicePixelRatio;

      // Change clientWidth and dispatch resize
      Object.defineProperty(canvas, "clientWidth", {
        value: 1200,
        configurable: true,
      });

      window.dispatchEvent(new Event("resize"));

      expect(cancelAnimationFrame).toHaveBeenCalled();
      expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
      expect(canvas.width).toBe(1200 * dpr);

      // A new requestAnimationFrame should be scheduled after resize
      expect(
        (requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length,
      ).toBeGreaterThanOrEqual(2);
    });

    it("skips regeneration when width has not changed", async () => {
      const canvas = createMockCanvas(600);

      const { initGrass } = await import("./grass");
      initGrass(canvas);

      const initialRafCount = (requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length;

      // Dispatch resize without changing clientWidth
      window.dispatchEvent(new Event("resize"));

      expect(cancelAnimationFrame).not.toHaveBeenCalled();
      expect((requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        initialRafCount,
      );
    });
  });
});
