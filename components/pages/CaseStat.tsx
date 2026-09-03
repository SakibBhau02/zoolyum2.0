"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * CaseStat - case-study metric with count-up animation.
 * Parses display values like "+42%", "3.2x", "-61%", "12k+", "92%"
 * into prefix / number / suffix and animates the numeric part on
 * viewport entry. Fires exactly once; falls back to static render
 * for unparseable values and reduced-motion users.
 */
export function CaseStat({
  value,
  label,
  index = 0,
}: {
  value: string;
  label: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState<string | null>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const m = /^([+-]?)(\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
    if (!m) return;
    const prefix = m[1];
    const num = parseFloat(m[2]);
    const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
    const suffix = m[3];
    const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

    let raf = 0;
    let done = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done) return;
        done = true;
        observer.disconnect();
        if (reduced) {
          setDisplay(format(num));
          return;
        }
        const start = performance.now() + index * 140;
        const duration = 1400;
        const tick = (now: number) => {
          const p = Math.min(1, Math.max(0, (now - start) / duration));
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(format(num * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
          else setDisplay(format(num));
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduced, index]);

  return (
    <div ref={ref}>
      <p className="font-display text-5xl font-semibold tracking-tight text-sienna tabular-nums md:text-6xl">
        {display ?? value}
      </p>
      <p className="body-copy mt-3 font-body text-sm font-medium tracking-wide text-ivory/60">
        {label}
      </p>
    </div>
  );
}