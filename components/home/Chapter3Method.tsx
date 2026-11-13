"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { AccentSplit } from "@/components/ui/AccentSplit";

export type MethodCopy = {
  eyebrow: string; title: string; lead: string; hint: string;
  stages: { num: string; title: string; detail: string; outputs: string[] }[];
};

/**
 * Chapter 3 - The Method.
 *
 * Five stages move left to right in a native, snap-aligned rail.
 * This used to be a pinned, vertically-scrubbed horizontal traverse:
 * the wheel was hijacked for 2.5 viewports so five cards could drift
 * sideways. It cost ~2,600px of extra page length and is the pattern
 * NN/g's scrolljacking research singles out for fatigue and
 * disorientation. A rail with visible controls tells the reader
 * exactly what it is and how long it is.
 */
export function Chapter3Method({ copy }: { copy: MethodCopy }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;

    if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
    if (stageRef.current) {
      const idx = Math.min(
        copy.stages.length,
        Math.max(1, Math.round(p * (copy.stages.length - 1)) + 1),
      );
      stageRef.current.textContent = `STAGE ${String(idx).padStart(2, "0")} / 0${copy.stages.length}`;
    }
  }, [copy.stages.length]);

  const nudge = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-14 md:py-20"
      aria-label="The method"
    >
      <div className="dappled dappled--alt" aria-hidden="true" />
      <div className="section-shell relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
              <AccentSplit text={copy.title} accentClassName="text-ivory/55" />
            </h2>
            <p className="body-copy mt-5 font-body text-lead text-ivory/60">
              {copy.lead}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span
              ref={stageRef}
              className="font-body text-xs font-medium tracking-[0.2em] text-sienna-bright tabular-nums"
            >
              STAGE 01 / 0{copy.stages.length}
            </span>
            <div className="flex gap-2">
              <RailButton label="Previous stages" onClick={() => nudge(-1)}>
                <path d="M12 10H4m0 0 4-4m-4 4 4 4" />
              </RailButton>
              <RailButton label="Next stages" onClick={() => nudge(1)}>
                <path d="M4 10h12m0 0-5-5m5 5-5 5" />
              </RailButton>
            </div>
          </div>
        </div>

        {/* The Signal Thread, drawn forward by the rail */}
        <div className="relative mt-10">
          <div
            className="absolute left-0 right-0 top-[11px] hidden h-[2px] overflow-hidden bg-olive/25 md:block"
            aria-hidden="true"
          >
            <div
              ref={fillRef}
              className="thread h-full w-full origin-left"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <div
            ref={trackRef}
            onScroll={sync}
            tabIndex={0}
            role="group"
            aria-label="The five stages of the method"
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {copy.stages.map((stage) => (
              <article
                key={stage.num}
                className="card-surface relative flex w-[300px] shrink-0 snap-start flex-col p-7 md:w-[420px] md:pt-12 lg:w-[520px]"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-8 top-[7px] hidden h-[10px] w-[10px] rounded-full border-2 border-sienna bg-umber md:block"
                />
                <span className="font-display text-4xl font-semibold tracking-tight text-sienna/90">
                  {stage.num}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ivory">
                  {stage.title}
                </h3>
                <p className="body-copy mt-4 font-body text-[15px] leading-relaxed text-ivory/60">
                  {stage.detail}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2 md:mt-auto md:pt-6">
                  {stage.outputs.map((output) => (
                    <li
                      key={output}
                      className="rounded-full border border-olive/30 px-3 py-1 font-body text-[11px] font-medium tracking-wide text-ivory/55"
                    >
                      {output}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
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