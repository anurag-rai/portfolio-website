import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { theme } from "../config/theme";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/**
 * Initializes Lenis smooth scroll and syncs it with GSAP's ticker.
 * Returns the Lenis instance, or null if reduced motion is preferred.
 */
export function initSmoothScroll(): Lenis | null {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) return null;

  lenis = new Lenis({
    duration: theme.scroll.duration,
    easing: theme.scroll.easing,
    touchMultiplier: theme.scroll.touchMultiplier,
  });

  // Sync Lenis with GSAP ticker
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Update ScrollTrigger on Lenis scroll
  lenis.on("scroll", ScrollTrigger.update);

  return lenis;
}

/** Smooth-scrolls to a target selector. Falls back to native scrollIntoView if Lenis is unavailable. */
export function scrollTo(target: string) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.5 });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }
}
