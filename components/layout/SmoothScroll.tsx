"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/lib/hooks";
import { registerSmoothScroll } from "@/lib/smooth-scroll";

/**
 * SmoothScroll — the inertial scroll layer the site was designed for.
 *
 * Lenis drives the real document scroll position (not a transform), so
 * GSAP ScrollTrigger keeps working; we just hand Lenis' frame clock to
 * GSAP's ticker and tell ScrollTrigger to re-read on every Lenis tick.
 * Without this the page is native-wheel scroll underneath a 91-animation
 * composition, which is exactly what reads as "not smooth".
 *
 * Reduced-motion users get native scrolling — no hijacking at all.
 */
export function SmoothScroll() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

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

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Never let GSAP clamp the clock — that is what makes pinned
    // sequences stutter after a dropped frame.
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      registerSmoothScroll(null);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Every route change starts at the top, instantly — Lenis owns the
  // scroll position, so Next's native reset alone can be ignored.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
