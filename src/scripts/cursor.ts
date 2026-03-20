import { theme } from "../config/theme";

/**
 * Creates a custom cursor with a dot (inner) and circle (outer) that follow the mouse.
 * Only activates on devices with a precise pointer (mouse/trackpad).
 * The circle has a damped lerp for a trailing effect.
 * Scales up on hover over interactive elements defined in `theme.cursor.hoverTargets`.
 */
export function initCustomCursor() {
  const hasFineCursor = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!hasFineCursor || prefersReducedMotion) return;

  const { dotSize, circleSize, lerpSpeed, hoverScale, hoverTargets } = theme.cursor;

  const dot = document.createElement("div");
  const circle = document.createElement("div");
  const baseStyles =
    "pointer-events: none; position: fixed; top: 0; left: 0; z-index: 9998; border-radius: 50%; transition: transform 0.15s ease;";
  dot.style.cssText = `${baseStyles} width: ${dotSize}px; height: ${dotSize}px; background: var(--accent); transform: translate(-50%, -50%);`;
  circle.style.cssText = `${baseStyles} width: ${circleSize}px; height: ${circleSize}px; border: 1px solid var(--accent); transform: translate(-50%, -50%);`;
  document.body.appendChild(dot);
  document.body.appendChild(circle);
  document.body.style.cursor = "none";

  let mouseX = 0,
    mouseY = 0,
    circleX = 0,
    circleY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animate() {
    circleX += (mouseX - circleX) * lerpSpeed;
    circleY += (mouseY - circleY) * lerpSpeed;
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener("mouseover", (e) => {
    if ((e.target as Element).closest(hoverTargets)) {
      dot.style.transform = `translate(-50%, -50%) scale(${hoverScale})`;
      circle.style.transform = `translate(-50%, -50%) scale(${hoverScale})`;
      circle.style.borderColor = "var(--accent)";
      circle.style.background = "rgba(203, 153, 126, 0.1)";
    }
  });

  document.addEventListener("mouseout", (e) => {
    if ((e.target as Element).closest(hoverTargets)) {
      dot.style.transform = "translate(-50%, -50%) scale(1)";
      circle.style.transform = "translate(-50%, -50%) scale(1)";
      circle.style.background = "transparent";
    }
  });
}
