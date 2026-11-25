"use client";

import { AccentSplit } from "@/components/ui/AccentSplit";
import { HorizontalChapter } from "./HorizontalChapter";

export type MethodCopy = {
  eyebrow: string; title: string; lead: string; hint: string;
  stages: { num: string; title: string; detail: string; outputs: string[] }[];
};

/**
 * Chapter 3 — The Method.
 *
 * Its own scroll-driven traverse: on desktop the chapter sticks and vertical
 * scroll moves the five stages sideways; below 1024px (and with reduced
 * motion) it is a native snap rail. Selected Work is a separate chapter with
 * the same mechanic, not merged into this one.
 */
export function Chapter3Method({ copy }: { copy: MethodCopy }) {
  return (
    <HorizontalChapter
      id="chapter-method"
      ariaLabel="The method"
      counterPrefix="STAGE"
      total={copy.stages.length}
      hint={copy.hint || "SCROLL TO TRAVERSE"}
      className="border-y border-olive/15 bg-umber/40"
      header={
        <div className="section-shell w-full pt-20 lg:pt-0">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-display-2 font-semibold text-ivory">
            <AccentSplit text={copy.title} accentClassName="text-ivory/70" />
          </h2>
          <p className="body-copy mt-5 max-w-xl font-body text-lead text-ivory/60">{copy.lead}</p>
        </div>
      }
    >
      {copy.stages.map((stage) => (
        <article
          key={stage.num}
          data-card
          className="card-surface relative flex w-[300px] shrink-0 snap-start flex-col p-7 md:w-[400px] md:pt-10 lg:w-[440px]"
        >
          <span
            aria-hidden="true"
            className="absolute left-7 top-[7px] hidden h-[10px] w-[10px] rounded-full border-2 border-sienna bg-umber md:block"
          />
          <span className="font-display text-3xl font-semibold tracking-tight text-sienna/90 tabular-nums">
            {stage.num}
          </span>
          <h3 className="mt-3 font-display text-2xl font-semibold text-ivory">{stage.title}</h3>
          <p className="body-copy mt-4 font-body text-[15px] leading-relaxed text-ivory/60">{stage.detail}</p>
          <ul className="mt-6 flex flex-wrap gap-2 md:mt-auto md:pt-6">
            {stage.outputs.map((output) => (
              <li
                key={output}
                className="rounded-full border border-olive/30 px-3 py-1 font-body text-[11px] font-medium tracking-wide text-ivory/70"
              >
                {output}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </HorizontalChapter>
  );
}
