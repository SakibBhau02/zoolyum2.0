"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentSplit } from "@/components/ui/AccentSplit";

export type MethodCopy = {
  eyebrow: string; title: string; lead: string; hint: string;
  stages: { num: string; title: string; detail: string; outputs: string[] }[];
};

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Chapter 3 - The Method.
 * Desktop: the section pins and the timeline traverses left to right
 * as the reader scrolls - the Signal Thread draws forward the whole
 * way, doing structural work. Mobile / reduced motion: native snap
 * scrolling; the thread follows the track's own scroll position.
 */
export function Chapter3Method({ copy }: { copy: MethodCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);

  const setStageLabel = (p: number) => {
    const el = stageRef.current;
    if (!el) return;
    const idx = Math.min(
      copy.stages.length,
      Math.max(1, Math.round(p * (copy.stages.length - 1)) + 1),
    );
    el.textContent = `STAGE ${String(idx).padStart(2, "0")} / 0${copy.stages.length}`;
  };

  // Native horizontal scroll (mobile fallback) drives the thread.
  const onScroll = () => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    fill.style.transform = `scaleX(${p})`;
    setStageLabel(p);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = sectionRef.current;
          const track = trackRef.current;
          const fill = fillRef.current;
          if (!section || !track) return;

          gsap.set(track, { overflowX: "visible" });
          const distance = () =>
            Math.max(0, track.scrollWidth - window.innerWidth + 96);

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance() + window.innerHeight * 0.35}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (fill) fill.style.transform = `scaleX(${self.progress})`;
                setStageLabel(self.progress);
              },
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
            gsap.set(track, { clearProps: "all" });
          };
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-24 md:py-32"
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
          <div className="hidden items-center gap-6 lg:flex">
            <span
              ref={stageRef}
              className="font-body text-xs font-medium tracking-[0.2em] text-sienna-bright tabular-nums"
            >
              STAGE 01 / 0{copy.stages.length}
            </span>
            <span className="font-body text-xs tracking-[0.2em] text-ivory/35">
              {copy.hint}
            </span>
          </div>
        </div>

        {/* The Signal Thread, drawn forward by the traverse */}
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
            {copy.stages.map((stage) => (
              <article
                key={stage.num}
                className="card-surface relative flex w-[300px] shrink-0 snap-start flex-col p-7 md:w-[420px] md:pt-12 lg:w-[520px]"
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