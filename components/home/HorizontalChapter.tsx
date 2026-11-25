"use client";

import { useCallback, useEffect, useRef, type ReactNode, type Ref } from "react";
import { useMediaQuery } from "@/lib/hooks";
import { scrollToY } from "@/lib/smooth-scroll";

/**
 * A single chapter with its own scroll-driven horizontal traverse.
 *
 * Desktop: the section is tall, the panel is CSS-sticky, and vertical scroll
 * translates the card track sideways. Mobile and reduced-motion keep a native
 * snap rail. Each chapter owns its height, progress bar and counter, so The
 * Method and Selected Work stay independent sections.
 */
export function HorizontalChapter({
  id,
  ariaLabel,
  counterPrefix,
  total,
  hint,
  header,
  children,
  className = "",
  trackClassName = "",
}: {
  id?: string;
  ariaLabel: string;
  counterPrefix: string;
  total: number;
  hint: string;
  header: ReactNode;
  children: ReactNode;
  className?: string;
  trackClassName?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  // Horizontal travel required to reach the last card. Held in a ref so nudge()
  // and update() always agree on the geometry.
  const distanceRef = useRef(0);

  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const desktop = useMediaQuery("(min-width: 1024px)");
  const enabled = desktop && !reduced;

  const pad = (n: number) => String(n).padStart(2, "0");

  const apply = useCallback(
    (p: number, distance: number) => {
      const track = trackRef.current;
      if (track && enabled && distance > 0) {
        track.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (counterRef.current) {
        const position = Math.max(1, Math.min(total, Math.round(1 + p * (total - 1))));
        counterRef.current.textContent = `${counterPrefix} ${pad(position)} / ${pad(total)}`;
      }
      if (prevRef.current) prevRef.current.disabled = p <= 0.002;
      if (nextRef.current) nextRef.current.disabled = p >= 0.998;
    },
    [counterPrefix, enabled, total],
  );

  const nudge = useCallback(
    (direction: 1 | -1) => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      if (!enabled) {
        const card = track.firstElementChild as HTMLElement | null;
        const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
        track.scrollBy({ left: direction * step, behavior: "smooth" });
        return;
      }

      const distance = distanceRef.current;
      if (distance <= 0) return;
      const rect = section.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / distance));
      const step = 1 / Math.max(1, total - 1);
      const next = Math.min(1, Math.max(0, p + direction * step));
      scrollToY(top + next * distance);
    },
    [enabled, total],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let frame = 0;
    let distance = 0;

    const update = () => {
      frame = 0;
      if (!enabled) return;
      const rect = section.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / Math.max(1, distance)));
      apply(p, distance);
    };

    const measure = () => {
      if (!enabled) {
        distanceRef.current = 0;
        section.style.height = "";
        track.style.transform = "";
        const max = track.scrollWidth - track.clientWidth;
        apply(max > 0 ? track.scrollLeft / max : 0, 0);
        return;
      }
      track.style.transform = "translate3d(0, 0, 0)";
      // scrollWidth omits a trailing padding, so add the right gutter back.
      const padRight = parseFloat(getComputedStyle(track).paddingRight) || 0;
      distance = Math.max(0, track.scrollWidth - window.innerWidth + padRight);
      distanceRef.current = distance;
      section.style.height = `${window.innerHeight + distance}px`;
      update();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onTrackScroll = () => {
      if (enabled) return;
      const max = track.scrollWidth - track.clientWidth;
      apply(max > 0 ? track.scrollLeft / max : 0, 0);
    };

    const onKey = (event: KeyboardEvent) => {
      if (!enabled) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      nudge(event.key === "ArrowRight" ? 1 : -1);
    };

    measure();
    const settle = window.setTimeout(measure, 450);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    section.addEventListener("keydown", onKey);
    track.addEventListener("scroll", onTrackScroll, { passive: true });

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      section.removeEventListener("keydown", onKey);
      track.removeEventListener("scroll", onTrackScroll);
      if (frame) cancelAnimationFrame(frame);
      section.style.height = "";
      track.style.transform = "";
    };
  }, [apply, enabled, nudge]);

  return (
    <section
      ref={sectionRef}
      id={id}
      tabIndex={0}
      aria-label={ariaLabel}
      className={`relative outline-none focus-visible:ring-2 focus-visible:ring-sienna-bright/70 ${className}`}
    >
      <div
        className={
          enabled
            ? "lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden lg:pt-[72px]"
            : ""
        }
      >
        {header}

        <div className="relative mt-8">
          <div
            ref={trackRef}
            className={`flex gap-6 overflow-x-auto pl-6 pr-6 pb-4 scroll-pl-6 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden ${
              enabled
                ? "lg:snap-none lg:overflow-visible lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] lg:pr-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] lg:will-change-transform"
                : ""
            } ${trackClassName}`}
          >
            {children}
          </div>
        </div>

        <div className="section-shell mt-5 flex w-full items-center gap-4 pb-10 lg:mt-4 lg:gap-6 lg:pb-0">
          <span
            ref={counterRef}
            data-traverse-counter
            className="shrink-0 font-body text-[10px] font-semibold uppercase tracking-[0.2em] tabular-nums text-sienna-bright"
          >
            {counterPrefix} 01 / {pad(total)}
          </span>
          <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-olive/35" aria-hidden="true">
            <div ref={barRef} className="thread h-full w-full origin-left" style={{ transform: "scaleX(0)" }} />
          </div>
          <span className="hidden shrink-0 font-body text-[10px] uppercase tracking-[0.2em] text-ivory/62 md:inline">
            {hint}
          </span>
          <div className="flex shrink-0 gap-2">
            <RailButton ref={prevRef} label="Previous" onClick={() => nudge(-1)}>
              <path d="M12 10H4m0 0 4-4m-4 4 4 4" />
            </RailButton>
            <RailButton ref={nextRef} label="Next" onClick={() => nudge(1)}>
              <path d="M4 10h12m0 0-5-5m5 5-5 5" />
            </RailButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function RailButton({
  label,
  onClick,
  ref,
  children,
}: {
  label: string;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-olive/35 text-ivory/70 transition-all duration-300 hover:border-sienna-bright/60 hover:text-sienna-bright disabled:cursor-not-allowed disabled:border-olive/20 disabled:text-ivory/25 disabled:hover:border-olive/20 disabled:hover:text-ivory/25"
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}
