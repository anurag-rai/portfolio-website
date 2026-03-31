import { theme } from "../config/theme";

const MAX_TOASTS = 3;
const HOLD_MS = theme.toast.holdDurationMs;
const ANIMATE_IN_MS = 350;
const ANIMATE_OUT_MS = 300;
const GAP = 12;

interface ActiveToast {
  el: HTMLElement;
  timer: number;
}

const active: ActiveToast[] = [];

function getContainer(): HTMLElement {
  const el = document.getElementById("toast-container");
  if (el) return el;
  const c = document.createElement("div");
  c.id = "toast-container";
  c.style.cssText =
    "position:fixed;top:2rem;left:50%;transform:translateX(-50%);z-index:9999;pointer-events:none;display:flex;flex-direction:column;align-items:center;";
  c.setAttribute("aria-live", "polite");
  document.body.appendChild(c);
  return c;
}

function repositionToasts() {
  const container = getContainer();
  const children = Array.from(container.children) as HTMLElement[];
  let offset = 0;
  for (const child of children) {
    child.style.transform = `translateY(${offset}px) scale(1)`;
    offset += child.offsetHeight + GAP;
  }
}

function removeToast(entry: ActiveToast) {
  const idx = active.indexOf(entry);
  if (idx === -1) return;

  entry.el.style.transition = `opacity ${ANIMATE_OUT_MS}ms ease-in, transform ${ANIMATE_OUT_MS}ms ease-in`;
  entry.el.style.opacity = "0";

  setTimeout(() => {
    entry.el.remove();
    active.splice(active.indexOf(entry), 1);
    repositionToasts();
  }, ANIMATE_OUT_MS);
}

export function showToast(message: string, icon: string) {
  const container = getContainer();

  // Evict oldest if at capacity
  if (active.length >= MAX_TOASTS) {
    const oldest = active[0];
    clearTimeout(oldest.timer);
    removeToast(oldest);
  }

  const el = document.createElement("div");
  el.style.cssText = `opacity:0;transform:translateY(-20px) scale(0.9);transition:none;pointer-events:none;margin:0;`;
  el.innerHTML = `
    <div style="position:relative;display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:9999px;border:1px solid var(--accent);background:var(--bg);box-shadow:0 0 30px rgba(203,153,126,0.2),0 0 60px rgba(203,153,126,0.1);white-space:nowrap;">
      ${icon}
      <span style="font-size:14px;font-weight:500;color:var(--accent);">${message}</span>
      <div style="position:absolute;inset:0;border-radius:9999px;border:1px solid var(--accent);opacity:0;transform:scale(1);pointer-events:none;" data-ring></div>
    </div>
  `;

  container.appendChild(el);

  // Force reflow so the browser registers the initial opacity:0 before transitioning
  void el.offsetHeight;

  // Animate in
  el.style.transition = `opacity ${ANIMATE_IN_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${ANIMATE_IN_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  el.style.opacity = "1";

  // Ring pulse
  const ring = el.querySelector("[data-ring]") as HTMLElement | null;
  if (ring) {
    setTimeout(() => {
      ring.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
      ring.style.opacity = "0.5";
      ring.style.transform = "scale(1.6)";
      setTimeout(() => {
        ring.style.opacity = "0";
      }, 100);
    }, 150);
  }

  const entry: ActiveToast = {
    el,
    timer: window.setTimeout(() => removeToast(entry), HOLD_MS),
  };
  active.push(entry);

  repositionToasts();
}
