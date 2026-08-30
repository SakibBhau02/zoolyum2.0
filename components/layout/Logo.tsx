"use client";

import Link from "next/link";
import { useRef } from "react";

/**
 * Logo — wordmark with the Signal Thread running beneath it.
 * Triple-click it anywhere and the thread answers: a single amber
 * line sweeps the viewport (see SignalFlash).
 */
export function Logo({ withTagline = false }: { withTagline?: boolean }) {
  const clicks = useRef<number[]>([]);

  const handleClick = () => {
    const now = Date.now();
    clicks.current = clicks.current.filter((t) => now - t < 1400);
    clicks.current.push(now);
    if (clicks.current.length >= 3) {
      clicks.current = [];
      window.dispatchEvent(new CustomEvent("zoolyum:signal"));
    }
  };

  return (
    <Link href="/" onClick={handleClick} aria-label="Zoolyum — home" className="group flex items-center gap-3">
      <span className="flex flex-col">
        <span className="font-display text-lg font-semibold tracking-tight text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
          ZOOLYUM
        </span>
        <span
          aria-hidden="true"
          className="thread mt-0.5 w-full origin-left scale-x-100 transition-transform duration-500 ease-read group-hover:scale-x-110"
        />
      </span>
      {withTagline && (
        <span className="hidden border-l border-olive/40 pl-3 text-left font-body text-[10px] font-medium leading-snug tracking-[0.14em] text-ivory/50 xl:block">
          CONSULTANCY.
          <br />
          STRATEGY.
          <br />
          SOLUTION.
        </span>
      )}
    </Link>
  );
}
