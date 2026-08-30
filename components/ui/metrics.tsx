"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * StatCounter — slow, steady count-up on viewport entry.
 * 1.4s ease-out per the motion spec. No flash, no gimmick.
 */
export function StatCounter({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const [flash, setFlash] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        if (reduced) {
          setDisplay(value);
          return;
        }
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
          else {
            setFlash(true);
            window.setTimeout(() => setFlash(false), 700);
          }
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduced]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <p className={`font-display text-5xl font-semibold tracking-tight text-sienna tabular-nums md:text-6xl transition-all duration-500 ${flash ? "scale-105 text-sienna-bright stat-glow" : ""}`}>
        {display}
        <span className="text-gold">{suffix}</span>
      </p>
      <p className="body-copy mt-2 font-body text-sm font-medium tracking-wide text-ivory/60">
        {label}
      </p>
    </div>
  );
}

/**
 * ConfidenceIndicator — device #6: one quiet, precise metric per
 * case-study card, set in tabular numerals. No bars, no meters —
 * precision is the point.
 */
export function ConfidenceIndicator({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="font-display text-2xl font-semibold tracking-tight text-sienna tabular-nums">
        {value}
      </span>
      <span className="font-body text-sm text-ivory/55">{label}</span>
    </p>
  );
}
