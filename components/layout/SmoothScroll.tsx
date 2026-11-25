"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useMediaQuery } from "@/lib/hooks";
import { registerSmoothScroll } from "@/lib/smooth-scroll";

/**
 * SmoothScroll — the inertial scroll layer the site was designed for.
 *
 * Lenis drives the real document scroll position (not a transform), so the
 * scroll-driven chapters and every IntersectionObserver keep working.
 *
 * This used to hand Lenis' frame clock to GSAP's ticker and register
 * ScrollTrigger, which pulled ~70KB of animation runtime into the shared
 * bundle of every route. No page uses ScrollTrigger — the home chapters are
 * rAF-driven — so the loop is now a plain requestAnimationFrame. That removes
 * GSAP from the critical path entirely.
 *
 * Reduced-motion users get native scrolling — no hijacking at all.
 */
export function SmoothScroll() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Touch devices keep native scrolling. Lenis on a phone buys nothing and
    // costs a permanent rAF loop plus wheel/touch listeners on the main thread.
    if (reduced || !finePointer) return;

    const lenis = new Lenis({
      duration: 1.05,
      // A short, predictable easing: enough inertia to feel considered,
      // not enough to feel laggy or "slippery".
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    registerSmoothScroll(lenis);

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      registerSmoothScroll(null);
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced, finePointer]);

  // Every route change starts at the top, instantly — Lenis owns the
  // scroll position, so Next's native reset alone can be ignored.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
