"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * TerrainScrollIndicator — device #1.
 * A slim line at the top of the viewport that fills with the
 * Terrain Gradient as the user scrolls. On the homepage it
 * waits for the Signal Thread handoff at the end of Chapter 1;
 * everywhere else it is present from the start.
 *
 * Everything here writes straight to the DOM. An earlier version kept
 * progress in React state, which meant a full component re-render on
 * every scroll frame — the single largest main-thread cost on the page.
 */
export function TerrainScrollIndicator() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const shellRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);
  const maxScroll = useRef(0);

  useEffect(() => {
    const measure = () => {
      maxScroll.current = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const update = () => {
      ticking.current = false;
      const progress =
        maxScroll.current > 0
          ? Math.min(1, Math.max(0, window.scrollY / maxScroll.current))
          : 0;

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progress})`;
      }
      if (isHome && shellRef.current) {
        shellRef.current.style.opacity =
          document.documentElement.dataset.signal === "on" ? "1" : "0";
      }
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    // Pinned sections (and fonts) change the scrollable height after
    // mount, so track it with a ResizeObserver instead of reading
    // scrollHeight on every frame.
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.documentElement);

    measure();
    requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, pathname]);

  return (
    <div
      ref={shellRef}
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-[70] h-[3px] bg-espresso/40 transition-opacity duration-700 ${
        isHome ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        ref={fillRef}
        className="terrain-gradient h-full origin-left rounded-r-full"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
