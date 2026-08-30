"use client";

import { useRef } from "react";
import { PROCESS_STAGES } from "@/lib/data";

/**
 * Chapter 3 — The Method.
 * A horizontal timeline where the Signal Thread draws forward as
 * the user scrolls the track — the same amber line from Chapter 1,
 * now doing structural work.
 */
export function Chapter3Method() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    fill.style.transform = `scaleX(${p})`;
  };

  return (
    <section
      className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-24 md:py-32"
      aria-label="The method"
    >
      <div className="dappled dappled--alt" aria-hidden="true" />
      <div className="section-shell relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">The Method</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
              Five stages. <span className="text-ivory/55">One line of thinking.</span>
            </h2>
            <p className="body-copy mt-5 font-body text-lead text-ivory/60">
              The same disciplined sequence on every engagement — because
              method is what turns projects into positions.
            </p>
          </div>
          <p className="hidden font-body text-xs tracking-[0.2em] text-ivory/35 lg:block">
            SCROLL THE TIMELINE →
          </p>
        </div>

        {/* The Signal Thread, drawn forward by the track's scroll */}
        <div className="relative mt-14">
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
            onScroll={onScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PROCESS_STAGES.map((stage) => (
              <article
                key={stage.num}
                className="card-surface relative flex w-[300px] shrink-0 snap-start flex-col p-7 md:w-[420px] md:pt-12"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-8 top-[7px] hidden h-[10px] w-[10px] rounded-full border-2 border-sienna bg-umber md:block"
                />
                <span className="font-display text-4xl font-semibold tracking-tight text-sienna/30">
                  {stage.num}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ivory">
                  {stage.title}
                </h3>
                <p className="body-copy mt-4 font-body text-[15px] leading-relaxed text-ivory/60">
                  {stage.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
