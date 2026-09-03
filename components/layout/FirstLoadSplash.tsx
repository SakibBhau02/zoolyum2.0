"use client";

import { useEffect, useState } from "react";
import { ZigzagLoader } from "./ZigzagLoader";

/**
 * FirstLoadSplash - plays once per session on the first site load:
 * the mark's zigzag draws, the word settles, the curtain lifts.
 * Skipped entirely for reduced-motion users and repeat visits.
 */
export function FirstLoadSplash() {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");

  useEffect(() => {
    const timers: number[] = [];

    /* The seen-flag is written only when the splash actually plays,
       so a StrictMode double-invoked effect cannot strand it. */
    const start = () => {
      try {
        sessionStorage.setItem("z-splash", "1");
      } catch {
        /* private mode - still show, just cannot remember */
      }
      setPhase("show");
      timers.push(
        window.setTimeout(() => setPhase("fade"), 1250),
        window.setTimeout(() => setPhase("hidden"), 1750),
      );
    };

    let skip = false;
    try {
      if (sessionStorage.getItem("z-splash")) {
        skip = true;
      } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sessionStorage.setItem("z-splash", "1");
        skip = true;
      }
    } catch {
      /* private mode - cannot remember; show */
    }

    const kickoff = skip ? null : window.setTimeout(start, 0);
    return () => {
      if (kickoff) window.clearTimeout(kickoff);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-espresso transition-opacity duration-500 ease-out ${
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <ZigzagLoader />
    </div>
  );
}