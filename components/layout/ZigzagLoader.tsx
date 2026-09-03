"use client";

/**
 * ZigzagLoader - the mark's white signal zigzag, drawing itself.
 * Used as the route-loading state (app/loading.tsx) and as the
 * first-visit splash (FirstLoadSplash).
 */

const ZIGZAG = "M 14 40 L 38 16 L 52 36 L 72 10 L 86 34 L 106 20";

export function ZigzagLoader() {
  return (
    <div className="flex flex-col items-center justify-center" role="status" aria-label="Loading">
      <span className="relative flex h-[76px] w-[118px] items-center justify-center rounded-2xl bg-sienna shadow-[0_18px_50px_-18px_rgba(255,80,1,0.55)]">
        <svg viewBox="0 0 120 60" className="h-11 w-[86px]" aria-hidden="true" focusable="false">
          <path
            className="zig-glow"
            d={ZIGZAG}
            fill="none"
            stroke="#FF6A26"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="zig-stroke"
            d={ZIGZAG}
            fill="none"
            stroke="#F6F1E8"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
          />
        </svg>
      </span>
      <span className="zig-word mt-6 pl-[0.42em] font-display text-[13px] font-semibold tracking-[0.42em] text-ivory/60">
        ZOOLYUM
      </span>
    </div>
  );
}