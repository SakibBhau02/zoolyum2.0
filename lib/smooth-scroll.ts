import type Lenis from "lenis";

/**
 * Module-level handle on the live Lenis instance so overlays
 * (mobile menu, modals, lightbox, hero skip) can lock/unlock or move
 * page scroll without prop-drilling or a context provider.
 */
let instance: Lenis | null = null;

export function registerSmoothScroll(target: Lenis | null) {
  instance = target;
}

/** Freeze background scrolling while an overlay is open. */
export function lockScroll() {
  instance?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  instance?.start();
  document.documentElement.style.overflow = "";
}

/** Programmatic scroll that works with or without Lenis. */
export function scrollToY(y: number, immediate = false) {
  if (instance) {
    instance.scrollTo(y, { immediate, duration: immediate ? 0 : 1.1 });
    return;
  }
  window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}
