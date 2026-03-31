import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { theme } from "../config/theme";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Registers scroll-triggered fade-up reveals for all `[data-animate]` elements.
 * Animations replay on every scroll in/out. No-op if prefers-reduced-motion is set.
 */
export function initScrollAnimations() {
  if (prefersReducedMotion) return;

  // Generic reveal animation for elements with data-animate attribute
  const revealElements = document.querySelectorAll("[data-animate]");
  revealElements.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: theme.reveal.offset },
      {
        opacity: 1,
        y: 0,
        duration: theme.reveal.duration,
        ease: theme.reveal.ease,
        scrollTrigger: {
          trigger: el,
          start: theme.reveal.trigger.start,
          end: theme.reveal.trigger.end,
          toggleActions: theme.reveal.trigger.toggleActions,
        },
      },
    );
  });
}

/**
 * Splits text content of matched elements into individual character `<span>`s
 * and animates them in with a staggered reveal on scroll.
 * Original text is preserved in `aria-label` for accessibility.
 * @param selector - CSS selector for target elements (e.g. "#about [data-split]")
 * @param stagger - Delay between each character animation in seconds
 */
export function splitTextReveal(selector: string, stagger = theme.reveal.splitText.stagger) {
  if (prefersReducedMotion) return;

  // Manual character splitting (avoids GSAP SplitText license requirement)
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    const text = el.textContent || "";
    el.innerHTML = "";
    el.setAttribute("aria-label", text);

    text.split(" ").forEach((word, wordIndex) => {
      if (wordIndex > 0) {
        const space = document.createElement("span");
        space.className = "char";
        space.textContent = "\u00A0";
        space.style.display = "inline-block";
        space.setAttribute("aria-hidden", "true");
        el.appendChild(space);
      }

      const wordWrap = document.createElement("span");
      wordWrap.style.display = "inline-block";
      wordWrap.style.whiteSpace = "nowrap";
      wordWrap.setAttribute("aria-hidden", "true");

      word.split("").forEach((char) => {
        const charSpan = document.createElement("span");
        charSpan.className = "char";
        charSpan.textContent = char;
        charSpan.style.display = "inline-block";
        charSpan.setAttribute("aria-hidden", "true");
        wordWrap.appendChild(charSpan);
      });

      el.appendChild(wordWrap);
    });

    gsap.fromTo(
      el.querySelectorAll(".char"),
      { opacity: 0, y: theme.reveal.splitText.offset },
      {
        opacity: 1,
        y: 0,
        duration: theme.reveal.splitText.duration,
        stagger,
        ease: theme.reveal.splitText.ease,
        scrollTrigger: {
          trigger: el,
          start: theme.reveal.trigger.start,
          end: theme.reveal.trigger.end,
          toggleActions: theme.reveal.trigger.toggleActions,
        },
      },
    );
  });
}
