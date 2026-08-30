"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * SignalFlash — the quiet easter egg: triple-click the logo and a
 * single amber line sweeps across the viewport. Reduced-motion
 * users get one soft glow.
 */
export function SignalFlash() {
  const [flash, setFlash] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const onSignal = () => {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1100);
    };
    window.addEventListener("zoolyum:signal", onSignal);
    return () => window.removeEventListener("zoolyum:signal", onSignal);
  }, []);

  if (!flash) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
      {reduced ? (
        <div className="absolute inset-0 bg-sienna/15 transition-opacity duration-500" />
      ) : (
        <>
          <div className="signal-sweep-line thread absolute top-1/2 w-full" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,112,46,0.12),transparent_65%)]" />
        </>
      )}
    </div>
  );
}
