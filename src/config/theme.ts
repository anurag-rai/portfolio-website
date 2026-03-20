/**
 * Theme configuration for animations, interactions, and visual effects.
 * These values define the portfolio's motion design language.
 * Extracted here so they can be tuned independently of component logic.
 */
export const theme = {
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
    holdDurationMs: 2000,
  },
} as const;
