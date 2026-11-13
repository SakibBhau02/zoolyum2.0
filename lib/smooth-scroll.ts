/**
 * Module-level handle on the live Lenis instance so overlays
 * (mobile menu, modals, lightbox) can lock/unlock page scroll
 * without prop-drilling or a context provider.
 */
type ScrollLockTarget = {
  stop: () => void;
  start: () => void;
};

let instance: ScrollLockTarget | null = null;

export function registerSmoothScroll(target: ScrollLockTarget | null) {
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
