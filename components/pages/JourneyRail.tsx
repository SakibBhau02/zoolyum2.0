"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * JourneyRail - sticky index rail for story pages.
 * Tracks the active chapter via IntersectionObserver. Deliberately
 * static: no thread-fill or marker animation, only a quiet color
 * change on the active chapter. Desktop rail; mobile compact bar.
 * Pass rail={false} to hide the desktop rail but keep the mobile bar.
 */
export function JourneyRail({
  chapters,
  rail = true,
}: {
  chapters: { id: string; label: string }[];
  rail?: boolean;
}) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");
  const desktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.15, 0.4] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters]);

  if (!desktop) {
    return (
      <div
        className="sticky top-[72px] z-30 border-y border-olive/15 bg-espresso/70 backdrop-blur-md"
        aria-label="Chapter navigation"
      >
        <div className="flex gap-1 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chapters.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-body text-xs font-medium tracking-wide transition-colors ${
                active === c.id
                  ? "bg-sienna/15 text-sienna-bright"
                  : "text-ivory/50 hover:text-ivory/80"
              }`}
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (!rail) return null;

  return (
    <nav
      aria-label="Chapter navigation"
      className="sticky top-[104px] z-30 hidden w-56 shrink-0 self-start lg:block"
    >
      <div className="relative pl-1">
        <div className="absolute left-[6px] top-2 bottom-2 w-[2px] bg-olive/25" aria-hidden="true" />
        <ul className="space-y-5">
          {chapters.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className={`group flex items-center gap-4 py-0.5 transition-opacity ${
                  active === c.id ? "" : "opacity-55 hover:opacity-90"
                }`}
                aria-current={active === c.id ? "true" : undefined}
              >
                <span
                  aria-hidden="true"
                  className={`relative z-10 h-[12px] w-[12px] shrink-0 rounded-full border-2 transition-colors ${
                    active === c.id
                      ? "border-sienna bg-sienna"
                      : "border-olive/50 bg-espresso"
                  }`}
                />
                <span
                  className={`font-body text-[13px] tracking-wide transition-colors ${
                    active === c.id ? "text-sienna-bright" : "text-ivory/70"
                  }`}
                >
                  {c.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}