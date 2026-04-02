/**
 * Theme configuration for animations, interactions, and visual effects.
 * These values define the portfolio's motion design language.
 * Extracted here so they can be tuned independently of component logic.
 */
export const theme = {
  /** Typography scale — single source of truth for all text styles.
   *  Each token is a string of Tailwind classes (size, weight, tracking, leading).
   *  Color and layout classes stay in the components. */
  typography: {
    display: "text-[clamp(2.5rem,6vw,5rem)] font-[800] tracking-[-2px]",
    heading: "text-[clamp(2rem,4.5vw,2.75rem)] font-[700] tracking-[-0.5px]",
    title: "text-2xl font-[700]",
    subtitle: "text-xl font-[600]",
    heroSubtitle: "text-[clamp(0.875rem,1.75vw,1rem)] font-[300] tracking-[3px] uppercase",
    body: "text-lg leading-relaxed",
    bodySmall: "text-base leading-relaxed",
    accent: "text-base font-[500]",
    caption: "text-sm font-[300]",
    label: "text-xs font-[300] uppercase",
    pill: "text-sm font-[500]",
    pillSmall: "text-xs font-[500]",
    nav: "text-base font-[400]",
    navBrand: "text-base font-[600]",
    navMobile: "text-3xl font-[600]",
    button: "text-base font-[500]",
    link: "text-base",
    preloaderCounter: "text-[clamp(1.75rem,4.5vw,2.75rem)] font-[800] tracking-[-1px]",
  },


  /** Lenis smooth scroll configuration */
  scroll: {
    duration: 1.2,
    /** Deceleration easing: fast start, smooth stop */
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
  },

  /** Preloader timing */
  preloader: {
    /** Minimum display time in ms (prevents flash on fast connections) */
    minDurationMs: 3500,
    /** Fallback timeout for Three.js scene in ms */
    sceneFallbackMs: 5000,
    /** Lerp speed for normal progress tracking */
    lerpSpeed: 0.08,
    /** Lerp speed for final sprint to 100% */
    fastLerpSpeed: 0.25,
  },

  /** Scroll-triggered reveal animations */
  reveal: {
    /** Default fade-in + Y offset for data-animate elements */
    offset: 40,
    duration: 0.8,
    ease: "power2.out",
    /** Character split text animation */
    splitText: {
      offset: 12,
      duration: 0.15,
      stagger: 0.008,
      ease: "power2.out",
    },
    /** ScrollTrigger defaults for reveal animations */
    trigger: {
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "restart reverse restart reverse" as const,
    },
  },

  /** Custom cursor settings (desktop only) */
  cursor: {
    dotSize: 6,
    circleSize: 36,
    /** Lerp speed for circle following the dot */
    lerpSpeed: 0.15,
    /** Scale multiplier on hover */
    hoverScale: 1.5,
    /** CSS selectors for elements that trigger hover state */
    hoverTargets: "a, button, .project-card",
  },

  /** Hero 3D scene configuration */
  heroScene: {
    /** Camera distance from origin */
    cameraZ: 5,
    /** Wireframe material opacity */
    wireframeOpacity: 0.15,
    /** Wireframe color (terracotta accent) */
    wireframeColor: "#cb997e",
    /** Radius within which shapes flee from cursor (world units) */
    avoidRadius: 2.5,
    /** Speed at which shapes move toward target position */
    lerpSpeed: 0.05,
    /** Device orientation beta offset (phones held at ~45 degrees) */
    tiltBetaOffset: 45,
    /** Max tilt angle mapped to full range (degrees) */
    tiltMaxAngle: 30,
  },

  /** Navbar animation */
  navbar: {
    showHideDuration: 0.3,
    ease: "power2.out",
  },

  /** Toast notification */
  toast: {
    /** Time the toast stays visible before fading (ms) */
    holdDurationMs: 4000,
  },

  /** Footer grass easter egg */
  grass: {
    /** Blades per 100px of canvas width — scales with viewport */
    bladeDensity: 24,
    height: { min: 30, max: 120 },
    baseWidth: { min: 6, max: 16 },
    lean: { min: -0.4, max: 0.4 },
    curve: { min: -0.3, max: 0.3 },
    sway: { minAmount: 3, maxAmount: 10, minSpeed: 0.4, maxSpeed: 1.2 },
    opacity: { min: 0.35, max: 0.85 },
    canvasHeight: 140,
    /** HSL color range for depth layering (back → front) */
    hue: { min: 75, max: 85 },
    lightness: { min: 40, max: 60 },
    saturation: 18,
    toastMessage: "Finally touching grass, huh?",
  },
} as const;
