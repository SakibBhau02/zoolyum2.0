"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * TerrainScrollIndicator — device #1.
 * A slim line at the top of the viewport that fills with the
 * Terrain Gradient as the user scrolls. On the homepage it
 * waits for the Signal Thread handoff at the end of Chapter 1;
 * everywhere else it is present from the start.
 */
export function TerrainScrollIndicator() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [progress, setProgress] = useState(0);
  const [signalOn, setSignalOn] = useState(!isHome);
  const ticking = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setSignalOn(!isHome || document.documentElement.dataset.signal === "on");
    });
  }, [isHome, pathname]);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
      if (isHome) {
        setSignalOn(document.documentElement.dataset.signal === "on");
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-[70] h-[3px] bg-espresso/40 transition-opacity duration-700 ${
        signalOn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="terrain-gradient h-full origin-left rounded-r-full"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
