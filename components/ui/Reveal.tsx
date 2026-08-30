"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Reveal — device #2, Reveal-on-Read: content fades and lifts in
 * as it enters the reading zone (upper ~85% of the viewport),
 * not the full viewport. Rise 16px, 600ms.
 *
 * variant="wipe" uses the Horizon Wipe instead (900ms).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  variant = "rise",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "figure" | "li" | "article" | "span";
  variant?: "rise" | "wipe";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`${variant === "wipe" ? "wipe-in" : "reveal"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/**
 * HorizonRule — device #4: the Terrain Gradient section divider
 * that wipes in softly when it enters the reading zone.
 */
export function HorizonRule({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`horizon-rule w-full ${className}`}
    />
  );
}
