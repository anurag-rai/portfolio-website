import { describe, it, expect } from "vitest";
import { theme } from "./theme";

describe("theme", () => {
  it("has all top-level sections", () => {
    expect(theme).toHaveProperty("typography");
    expect(theme).toHaveProperty("scroll");
    expect(theme).toHaveProperty("preloader");
    expect(theme).toHaveProperty("reveal");
    expect(theme).toHaveProperty("cursor");
    expect(theme).toHaveProperty("heroScene");
    expect(theme).toHaveProperty("navbar");
    expect(theme).toHaveProperty("toast");
    expect(theme).toHaveProperty("grass");
  });
});

describe("typography", () => {
  const tokens = Object.entries(theme.typography);

  it("contains at least one token", () => {
    expect(tokens.length).toBeGreaterThan(0);
  });

  it.each(tokens)("%s is a non-empty string", (_name, value) => {
    expect(typeof value).toBe("string");
    expect(value.length).toBeGreaterThan(0);
  });
});

describe("scroll", () => {
  it("has a positive duration", () => {
    expect(theme.scroll.duration).toBeGreaterThan(0);
  });

  it("has a positive touchMultiplier", () => {
    expect(theme.scroll.touchMultiplier).toBeGreaterThan(0);
  });

  it("easing returns approximately 0 for t=0", () => {
    expect(theme.scroll.easing(0)).toBeCloseTo(0, 2);
  });

  it("easing returns approximately 1 for t=1", () => {
    expect(theme.scroll.easing(1)).toBeCloseTo(1, 2);
  });

  it("easing is monotonically increasing for sampled points", () => {
    const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    const values = steps.map((t) => theme.scroll.easing(t));
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
});

describe("preloader", () => {
  it("has positive durations", () => {
    expect(theme.preloader.minDurationMs).toBeGreaterThan(0);
    expect(theme.preloader.sceneFallbackMs).toBeGreaterThan(0);
  });

  it("has positive lerp speeds", () => {
    expect(theme.preloader.lerpSpeed).toBeGreaterThan(0);
    expect(theme.preloader.fastLerpSpeed).toBeGreaterThan(0);
  });

  it("fastLerpSpeed is greater than lerpSpeed", () => {
    expect(theme.preloader.fastLerpSpeed).toBeGreaterThan(theme.preloader.lerpSpeed);
  });
});

describe("reveal", () => {
  it("has positive offset and duration", () => {
    expect(theme.reveal.offset).toBeGreaterThan(0);
    expect(theme.reveal.duration).toBeGreaterThan(0);
  });

  it("has a non-empty ease string", () => {
    expect(theme.reveal.ease.length).toBeGreaterThan(0);
  });

  it("splitText has positive values", () => {
    expect(theme.reveal.splitText.offset).toBeGreaterThan(0);
    expect(theme.reveal.splitText.duration).toBeGreaterThan(0);
    expect(theme.reveal.splitText.stagger).toBeGreaterThan(0);
  });

  it("splitText has a non-empty ease string", () => {
    expect(theme.reveal.splitText.ease.length).toBeGreaterThan(0);
  });

  it("trigger has non-empty scroll trigger strings", () => {
    expect(theme.reveal.trigger.start.length).toBeGreaterThan(0);
    expect(theme.reveal.trigger.end.length).toBeGreaterThan(0);
    expect(theme.reveal.trigger.toggleActions.length).toBeGreaterThan(0);
  });
});

describe("cursor", () => {
  it("has positive sizes", () => {
    expect(theme.cursor.dotSize).toBeGreaterThan(0);
    expect(theme.cursor.circleSize).toBeGreaterThan(0);
  });

  it("dotSize is smaller than circleSize", () => {
    expect(theme.cursor.dotSize).toBeLessThan(theme.cursor.circleSize);
  });

  it("has a positive lerpSpeed", () => {
    expect(theme.cursor.lerpSpeed).toBeGreaterThan(0);
  });

  it("hoverScale is greater than 1", () => {
    expect(theme.cursor.hoverScale).toBeGreaterThan(1);
  });

  it("has a non-empty hoverTargets selector", () => {
    expect(theme.cursor.hoverTargets.length).toBeGreaterThan(0);
  });
});

describe("heroScene", () => {
  it("has a positive cameraZ", () => {
    expect(theme.heroScene.cameraZ).toBeGreaterThan(0);
  });

  it("wireframeOpacity is between 0 and 1", () => {
    expect(theme.heroScene.wireframeOpacity).toBeGreaterThanOrEqual(0);
    expect(theme.heroScene.wireframeOpacity).toBeLessThanOrEqual(1);
  });

  it("wireframeColor is a valid hex color", () => {
    expect(theme.heroScene.wireframeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("has positive wireframe line width", () => {
    expect(theme.heroScene.wireframeLineWidth).toBeGreaterThan(0);
  });

  it("connectionRadius is positive", () => {
    expect(theme.heroScene.connectionRadius).toBeGreaterThan(0);
  });

  it("connectionOpacity is between 0 and 1", () => {
    expect(theme.heroScene.connectionOpacity).toBeGreaterThanOrEqual(0);
    expect(theme.heroScene.connectionOpacity).toBeLessThanOrEqual(1);
  });

  it("has positive connectionLineWidth", () => {
    expect(theme.heroScene.connectionLineWidth).toBeGreaterThan(0);
  });

  it("has positive shapeDensity", () => {
    expect(theme.heroScene.shapeDensity).toBeGreaterThan(0);
  });

  it("minShapes is less than maxShapes", () => {
    expect(theme.heroScene.minShapes).toBeLessThan(theme.heroScene.maxShapes);
  });

  it("minShapes is at least 1", () => {
    expect(theme.heroScene.minShapes).toBeGreaterThanOrEqual(1);
  });

  it("has positive avoidRadius", () => {
    expect(theme.heroScene.avoidRadius).toBeGreaterThan(0);
  });

  it("has positive lerpSpeed", () => {
    expect(theme.heroScene.lerpSpeed).toBeGreaterThan(0);
  });

  it("has positive shapeRepulsionRadius", () => {
    expect(theme.heroScene.shapeRepulsionRadius).toBeGreaterThan(0);
  });

  it("has positive shapeRepulsionStrength", () => {
    expect(theme.heroScene.shapeRepulsionStrength).toBeGreaterThan(0);
  });

  it("spiralInnerRadius is between 0 and 1", () => {
    expect(theme.heroScene.spiralInnerRadius).toBeGreaterThanOrEqual(0);
    expect(theme.heroScene.spiralInnerRadius).toBeLessThanOrEqual(1);
  });

  it("has positive shapeMinSpacing", () => {
    expect(theme.heroScene.shapeMinSpacing).toBeGreaterThan(0);
  });
});

describe("navbar", () => {
  it("has a positive showHideDuration", () => {
    expect(theme.navbar.showHideDuration).toBeGreaterThan(0);
  });

  it("has a non-empty ease string", () => {
    expect(theme.navbar.ease.length).toBeGreaterThan(0);
  });
});

describe("toast", () => {
  it("holdDurationMs is positive", () => {
    expect(theme.toast.holdDurationMs).toBeGreaterThan(0);
  });
});

describe("grass", () => {
  it("has positive bladeDensity", () => {
    expect(theme.grass.bladeDensity).toBeGreaterThan(0);
  });

  it("height.min is less than height.max", () => {
    expect(theme.grass.height.min).toBeLessThan(theme.grass.height.max);
  });

  it("height values are positive", () => {
    expect(theme.grass.height.min).toBeGreaterThan(0);
    expect(theme.grass.height.max).toBeGreaterThan(0);
  });

  it("baseWidth.min is less than baseWidth.max", () => {
    expect(theme.grass.baseWidth.min).toBeLessThan(theme.grass.baseWidth.max);
  });

  it("baseWidth values are positive", () => {
    expect(theme.grass.baseWidth.min).toBeGreaterThan(0);
    expect(theme.grass.baseWidth.max).toBeGreaterThan(0);
  });

  it("lean.min is less than lean.max", () => {
    expect(theme.grass.lean.min).toBeLessThan(theme.grass.lean.max);
  });

  it("curve.min is less than curve.max", () => {
    expect(theme.grass.curve.min).toBeLessThan(theme.grass.curve.max);
  });

  it("sway amounts are positive and min < max", () => {
    expect(theme.grass.sway.minAmount).toBeGreaterThan(0);
    expect(theme.grass.sway.maxAmount).toBeGreaterThan(0);
    expect(theme.grass.sway.minAmount).toBeLessThan(theme.grass.sway.maxAmount);
  });

  it("sway speeds are positive and min < max", () => {
    expect(theme.grass.sway.minSpeed).toBeGreaterThan(0);
    expect(theme.grass.sway.maxSpeed).toBeGreaterThan(0);
    expect(theme.grass.sway.minSpeed).toBeLessThan(theme.grass.sway.maxSpeed);
  });

  it("opacity values are between 0 and 1", () => {
    expect(theme.grass.opacity.min).toBeGreaterThanOrEqual(0);
    expect(theme.grass.opacity.min).toBeLessThanOrEqual(1);
    expect(theme.grass.opacity.max).toBeGreaterThanOrEqual(0);
    expect(theme.grass.opacity.max).toBeLessThanOrEqual(1);
  });

  it("opacity.min is less than opacity.max", () => {
    expect(theme.grass.opacity.min).toBeLessThan(theme.grass.opacity.max);
  });

  it("has positive canvasHeight", () => {
    expect(theme.grass.canvasHeight).toBeGreaterThan(0);
  });

  it("saturation is between 0 and 100", () => {
    expect(theme.grass.saturation).toBeGreaterThanOrEqual(0);
    expect(theme.grass.saturation).toBeLessThanOrEqual(100);
  });

  it("hue.min is less than hue.max", () => {
    expect(theme.grass.hue.min).toBeLessThan(theme.grass.hue.max);
  });

  it("lightness.min is less than lightness.max", () => {
    expect(theme.grass.lightness.min).toBeLessThan(theme.grass.lightness.max);
  });

  it("has a non-empty toastMessage", () => {
    expect(theme.grass.toastMessage.length).toBeGreaterThan(0);
  });
});
