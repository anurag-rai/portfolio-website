import { theme } from "../config/theme";

const { grass: config } = theme;

interface Blade {
  x: number;
  height: number;
  baseWidth: number;
  lean: number;
  curve: number;
  phase: number;
  speed: number;
  swayAmount: number;
  opacity: number;
  /** 0–1 depth layer: 0 = back (darker), 1 = front (lighter) */
  layer: number;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function bladeCountForWidth(canvasWidth: number): number {
  return Math.round((canvasWidth / 100) * config.bladeDensity);
}

function generateBlades(count: number, canvasWidth: number): Blade[] {
  const blades: Blade[] = [];
  for (let i = 0; i < count; i++) {
    blades.push({
      x: rand(-10, canvasWidth + 10),
      height: rand(config.height.min, config.height.max),
      baseWidth: rand(config.baseWidth.min, config.baseWidth.max),
      lean: rand(config.lean.min, config.lean.max),
      curve: rand(config.curve.min, config.curve.max),
      phase: rand(0, Math.PI * 2),
      speed: rand(config.sway.minSpeed, config.sway.maxSpeed),
      swayAmount: rand(config.sway.minAmount, config.sway.maxAmount),
      opacity: rand(config.opacity.min, config.opacity.max),
      layer: Math.random(),
    });
  }
  return blades.sort((a, b) => a.layer - b.layer);
}

function drawBlade(ctx: CanvasRenderingContext2D, b: Blade, time: number, h: number) {
  const sway = Math.sin(time * b.speed + b.phase) * b.swayAmount;
  const lean = b.lean * b.height + sway;
  const curvePush = b.curve * b.height * 0.6;

  const tipX = b.x + lean;
  const tipY = h - b.height;

  const cpX = b.x + lean * 0.5 + curvePush + sway * 0.3;
  const cpY = h - b.height * 0.55;

  const halfBase = b.baseWidth / 2;

  const lightness = config.lightness.min + b.layer * (config.lightness.max - config.lightness.min);
  const hue = config.hue.min + b.layer * (config.hue.max - config.hue.min);

  ctx.beginPath();
  ctx.moveTo(b.x - halfBase, h);
  ctx.quadraticCurveTo(cpX - halfBase * 0.3, cpY, tipX, tipY);
  ctx.quadraticCurveTo(cpX + halfBase * 0.3, cpY, b.x + halfBase, h);
  ctx.closePath();

  ctx.fillStyle = `hsla(${hue}, ${config.saturation}%, ${lightness}%, ${b.opacity})`;
  ctx.fill();
}

export function initGrass(canvas: HTMLCanvasElement) {
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) return;
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const dpr = window.devicePixelRatio || 1;
  const h = config.canvasHeight;

  function resize() {
    const w = canvas.clientWidth;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    return w;
  }

  let w = resize();
  let blades = generateBlades(bladeCountForWidth(w), w);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    for (const b of blades) {
      drawBlade(ctx, b, 0, h);
    }
    return;
  }

  let rafId: number;

  function draw(time: number) {
    const t = time * 0.001;
    ctx.clearRect(0, 0, w, h);

    for (const b of blades) {
      drawBlade(ctx, b, t, h);
    }

    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);

  window.addEventListener("resize", () => {
    const newW = canvas.clientWidth;
    if (newW === w) return;
    cancelAnimationFrame(rafId);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    w = resize();
    blades = generateBlades(bladeCountForWidth(w), w);
    rafId = requestAnimationFrame(draw);
  });
}
