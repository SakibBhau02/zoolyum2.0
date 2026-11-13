"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import type { ContentProject } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { ConfidenceIndicator } from "@/components/ui/metrics";
import { AccentSplit } from "@/components/ui/AccentSplit";
import { Tilt } from "@/components/ui/Tilt";

/**
 * Chapter 5 - Ground We've Helped Clients Hold.
 *
 * Featured work as positions held, on a native snap rail with visible
 * controls and a progress thread. Desktop previously pinned this
 * section and scrubbed the rail sideways for ~2.3 viewports of wheel
 * travel — the same scroll-jacking cost as Chapter 3, for a rail that
 * already worked natively on touch. The reader now keeps full control
 * of vertical position while the rail is something they choose to move.
 */
export type WorkCopy = { eyebrow: string; title: string; lead: string; cta: string; href: string; nextTitle: string; nextText: string; nextCta: string; nextHref: string };

export function Chapter5Work({ projects, copy }: { projects: ContentProject[]; copy: WorkCopy }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;
    const max = track.scrollWidth - track.clientWidth;
    fill.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
  };

  const nudge = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      id="chapter-work"
      className="relative overflow-hidden py-20 md:py-28"
      aria-label="Ground we've helped clients hold"
    >
      <div className="section-shell relative z-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
                <AccentSplit text={copy.title} accentClassName="accent-word" />
              </h2>
              <p className="body-copy mt-5 font-body text-lead text-ivory/60">
                {copy.lead}
              </p>
            </div>
            <Link href={copy.href} className="btn-ghost inline-flex shrink-0 items-center whitespace-nowrap font-display text-sm font-semibold text-sienna-bright">
              {copy.cta}
              <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="section-shell relative z-10">
          <div
            ref={trackRef}
            onScroll={onScroll}
            tabIndex={0}
            role="group"
            aria-label="Selected work"
            className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {projects.map((project) => (
              <Tilt key={project.slug} className="w-[300px] shrink-0 snap-center md:w-[248px]">
                <Link
                  href={`/work/${project.slug}`}
                  className="card-surface group flex h-full flex-col"
                >
                  <div className={`relative h-[150px] overflow-hidden bg-gradient-to-br md:h-[165px] ${project.gradient}`}>
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-4 left-4 select-none font-display text-[5.5rem] font-semibold leading-none tracking-tight text-espresso/20"
                    >
                      {project.client.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span className="absolute left-4 top-4 rounded-full bg-espresso/60 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-widest text-ivory backdrop-blur-sm">
                      {project.industry}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                      {project.client}
                    </h3>
                    <p className="body-copy mt-1.5 line-clamp-2 font-body text-[13px] leading-relaxed text-ivory/55">
                      {project.title}
                    </p>
                    <div className="mt-auto border-t border-olive/20 pt-4">
                      <ConfidenceIndicator
                        value={project.stats[0].value}
                        label={project.stats[0].label}
                      />
                    </div>
                  </div>
                </Link>
              </Tilt>
            ))}

            <div className="card-surface flex w-[300px] shrink-0 snap-center flex-col items-start justify-center gap-6 p-8 md:w-[280px]">
              <span className="thread w-12" aria-hidden="true" />
              <div>
                <h3 className="font-display text-xl font-semibold text-ivory">
                  {copy.nextTitle}
                </h3>
                <p className="body-copy mt-3 font-body text-sm leading-relaxed text-ivory/55">
                  {copy.nextText}
                </p>
              </div>
              <Link href={copy.nextHref} className="btn btn-primary !px-6 !py-3 !text-sm">
                {copy.nextCta}
              </Link>
            </div>
          </div>

          {/* Signal Thread progress for the rail */}
          <div className="mt-6 flex items-center gap-6" aria-hidden="true">
            <div className="relative h-[2px] flex-1 overflow-hidden bg-olive/25">
              <div
                ref={fillRef}
                className="thread h-full w-full origin-left"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <span className="font-body text-xs tracking-[0.2em] text-ivory/50">
              DRAG OR SWIPE
            </span>
            <div className="flex gap-2">
              <RailButton label="Previous projects" onClick={() => nudge(-1)}>
                <path d="M12 10H4m0 0 4-4m-4 4 4 4" />
              </RailButton>
              <RailButton label="Next projects" onClick={() => nudge(1)}>
                <path d="M4 10h12m0 0-5-5m5 5-5 5" />
              </RailButton>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-olive/35 text-ivory/70 transition-colors duration-300 hover:border-sienna-bright/60 hover:text-sienna-bright"
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