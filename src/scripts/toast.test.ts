// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("showToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  async function loadShowToast() {
    const mod = await import("./toast");
    return mod.showToast;
  }

  describe("container creation", () => {
    it("creates #toast-container on first call", async () => {
      const showToast = await loadShowToast();

      expect(document.getElementById("toast-container")).toBeNull();
      showToast("hello", "<span>icon</span>");
      const container = document.getElementById("toast-container");

      expect(container).not.toBeNull();
    });

    it("applies fixed positioning and centering styles", async () => {
      const showToast = await loadShowToast();
      showToast("hello", "<span>icon</span>");

      const container = document.getElementById("toast-container")!;
      expect(container.style.position).toBe("fixed");
      expect(container.style.zIndex).toBe("9999");
      expect(container.style.pointerEvents).toBe("none");
      expect(container.style.display).toBe("flex");
      expect(container.style.flexDirection).toBe("column");
      expect(container.style.alignItems).toBe("center");
    });

    it("reuses existing container on subsequent calls", async () => {
      const showToast = await loadShowToast();
      showToast("first", "<span>1</span>");
      showToast("second", "<span>2</span>");

      const containers = document.querySelectorAll("#toast-container");
      expect(containers.length).toBe(1);
    });
  });

  describe("toast element", () => {
    it("creates element with message text", async () => {
      const showToast = await loadShowToast();
      showToast("Copied!", "<span>icon</span>");

      const container = document.getElementById("toast-container")!;
      expect(container.children.length).toBe(1);
      expect(container.textContent).toContain("Copied!");
    });

    it("includes icon HTML in the toast", async () => {
      const showToast = await loadShowToast();
      showToast("hello", '<svg class="check-icon"></svg>');

      const container = document.getElementById("toast-container")!;
      const icon = container.querySelector(".check-icon");
      expect(icon).not.toBeNull();
    });

    it("contains a ring element with data-ring attribute", async () => {
      const showToast = await loadShowToast();
      showToast("hello", "<span>icon</span>");

      const ring = document.querySelector("[data-ring]");
      expect(ring).not.toBeNull();
    });

    it("starts with opacity 0 for animate-in", async () => {
      const showToast = await loadShowToast();
      showToast("hello", "<span>icon</span>");

      const container = document.getElementById("toast-container")!;
      const toast = container.children[0] as HTMLElement;
      // After the animate-in setup, opacity is set to "1"
      expect(toast.style.opacity).toBe("1");
    });
  });

  describe("accessibility", () => {
    it("container has aria-live polite", async () => {
      const showToast = await loadShowToast();
      showToast("hello", "<span>icon</span>");

      const container = document.getElementById("toast-container")!;
      expect(container.getAttribute("aria-live")).toBe("polite");
    });
  });

  describe("max capacity", () => {
    it("evicts oldest toast when adding a 4th", async () => {
      const showToast = await loadShowToast();
      showToast("first", "<span>1</span>");
      showToast("second", "<span>2</span>");
      showToast("third", "<span>3</span>");

      const container = document.getElementById("toast-container")!;
      expect(container.children.length).toBe(3);

      showToast("fourth", "<span>4</span>");

      // The oldest toast starts its fade-out (ANIMATE_OUT_MS = 300).
      // At this point we have 4 DOM children: the fading-out oldest + 3 visible.
      // After ANIMATE_OUT_MS, the oldest is removed from DOM.
      vi.advanceTimersByTime(300);

      expect(container.children.length).toBe(3);
      expect(container.textContent).not.toContain("first");
      expect(container.textContent).toContain("second");
      expect(container.textContent).toContain("third");
      expect(container.textContent).toContain("fourth");
    });
  });

  describe("auto-dismiss", () => {
    it("removes toast after hold duration", async () => {
      const showToast = await loadShowToast();
      showToast("temporary", "<span>icon</span>");

      const container = document.getElementById("toast-container")!;
      expect(container.children.length).toBe(1);

      // Advance past HOLD_MS (4000) to trigger removeToast
      vi.advanceTimersByTime(4000);

      // Then advance past ANIMATE_OUT_MS (300) for DOM removal
      vi.advanceTimersByTime(300);

      expect(container.children.length).toBe(0);
    });

    it("does not remove toast before hold duration", async () => {
      const showToast = await loadShowToast();
      showToast("stays", "<span>icon</span>");

      const container = document.getElementById("toast-container")!;
      vi.advanceTimersByTime(3999);

      expect(container.children.length).toBe(1);
      expect(container.textContent).toContain("stays");
    });
  });

  describe("repositioning", () => {
    it("repositions remaining toasts after eviction", async () => {
      const showToast = await loadShowToast();
      showToast("first", "<span>1</span>");
      showToast("second", "<span>2</span>");
      showToast("third", "<span>3</span>");

      const container = document.getElementById("toast-container")!;
      expect(container.children.length).toBe(3);

      // Adding a 4th triggers eviction of "first", which fades out
      showToast("fourth", "<span>4</span>");

      // Advance past ANIMATE_OUT_MS (300) so evicted toast is removed from DOM
      vi.advanceTimersByTime(300);

      expect(container.children.length).toBe(3);
      // After repositioning, the first remaining toast starts at translateY(0px)
      const first = container.children[0] as HTMLElement;
      expect(first.style.transform).toContain("translateY(0px)");
    });
  });

  describe("ring pulse animation", () => {
    it("triggers ring transition after 150ms delay", async () => {
      const showToast = await loadShowToast();
      showToast("hello", "<span>icon</span>");

      const ring = document.querySelector("[data-ring]") as HTMLElement;
      expect(ring).not.toBeNull();

      vi.advanceTimersByTime(150);

      expect(ring.style.opacity).toBe("0.5");
      expect(ring.style.transform).toBe("scale(1.6)");
    });

    it("fades ring out after pulse", async () => {
      const showToast = await loadShowToast();
      showToast("hello", "<span>icon</span>");

      const ring = document.querySelector("[data-ring]") as HTMLElement;

      // 150ms for initial delay + 100ms for fade-out delay
      vi.advanceTimersByTime(150 + 100);

      expect(ring.style.opacity).toBe("0");
    });
  });
});
