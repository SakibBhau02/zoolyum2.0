"use client";

import type { ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * MarqueeRow — infinite, always-moving marquee. Direction "ltr"
 * travels left → right, "rtl" the reverse. Content is duplicated
 * for a seamless loop; hover pauses (optional). Reduced-motion
 * users get the items laid out as a static grid, once.
 */
export function MarqueeRow({
  children,
  direction = "ltr",
  duration = 42,
  pauseOnHover = true,
  className = "",
}: {
  children: ReactNode;
  direction?: "ltr" | "rtl";
  duration?: number;
  pauseOnHover?: boolean;
  className?: string;
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  if (reduced) {
    return (
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>{children}</div>
    );
  }

  return (
    <div
      className={`marquee-fade marquee-hover-pause relative overflow-hidden ${
        pauseOnHover ? "" : "[&:hover_.animate-marquee-ltr]:[animation-play-state:running]"
      } ${className}`}
    >
      <div
        className={`marquee-track animate-marquee-${direction}`}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-stretch gap-6 pr-6">{children}</div>
        <div className="flex shrink-0 items-stretch gap-6 pr-6" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
