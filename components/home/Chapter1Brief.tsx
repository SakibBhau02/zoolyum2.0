"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ContentProject } from "@/lib/content";
import type { BriefArtifact, BriefScenario, BriefStage } from "@/lib/engagement";
import { Reveal } from "@/components/ui/Reveal";
import { AccentSplit } from "@/components/ui/AccentSplit";
import { LinkButton } from "@/components/ui/LinkButton";

export type BriefCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  meta: string;
  callLabel: string;
  yourCall: string;
  whatWeDid: string;
  whyNot: string;
  next: string;
  finish: string;
  previous: string;
  seeAll: string;
  idleTitle: string;
  idleBody: string;
  summaryEyebrow: string;
  stamp: string;
  caseCta: string;
  workCta: string;
  workHref: string;
  replay: string;
  reviewing: string;
  backToCurrent: string;
  stageNote: string;
};

const STORE_KEY = "zoolyum.brief.v1";
const pad = (n: number) => String(n).padStart(2, "0");

type Saved = { current: number; choices: Record<string, string>; summary: boolean };

/**
 * Chapter 01 — The Brief Table.
 *
 * One real engagement, five calls. The visitor picks a path at each stage;
 * the panel reveals the call Zoolyum actually made, the artifact it produced
 * and the trade-off behind the other paths. Numbers, quote and case link come
 * from the project record, never from the scenario copy.
 *
 * No pin, no canvas, no scroll-jacking: the whole loop fits one screen on
 * desktop and stacks into a stepper on mobile.
 */
export function Chapter1Brief({
  scenario,
  project,
  copy,
}: {
  scenario: BriefScenario;
  project?: ContentProject;
  copy: BriefCopy;
}) {
  const stages = scenario.stages;
  const [current, setCurrent] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [review, setReview] = useState<number | null>(null);
  const [summary, setSummary] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const evidenceRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);

  /* Restore a run in progress. Deferred to the next frame: the first render
     must match the server HTML, and a synchronous setState inside an effect
     would cascade. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem(STORE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Saved;
          if (saved && typeof saved === "object") {
            if (typeof saved.current === "number") {
              setCurrent(Math.max(0, Math.min(stages.length - 1, saved.current)));
            }
            if (saved.choices && typeof saved.choices === "object") setChoices(saved.choices);
            setSummary(Boolean(saved.summary));
          }
        }
      } catch {
        /* storage unavailable — start fresh */
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [stages.length]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ current, choices, summary }));
    } catch {
      /* ignore */
    }
  }, [hydrated, current, choices, summary]);

  const stageIndex = review ?? current;
  const stage = stages[stageIndex];
  const chosenId = choices[stage.id];
  const chosen = stage.options.find((option) => option.id === chosenId);
  const real = stage.options.find((option) => option.chosen) ?? stage.options[0];
  const isLast = current === stages.length - 1;

  const choose = (optionId: string) => {
    setChoices((prev) => ({ ...prev, [stage.id]: optionId }));
    if (review !== null) return;
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => {
        evidenceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  };

  const next = () => {
    if (review !== null) {
      setReview(null);
      return;
    }
    if (!chosen) return;
    if (isLast) {
      setSummary(true);
      return;
    }
    setCurrent((value) => Math.min(stages.length - 1, value + 1));
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
    window.setTimeout(() => questionRef.current?.focus({ preventScroll: true }), 60);
  };

  const back = () => {
    if (review !== null) {
      setReview(null);
      return;
    }
    setCurrent((value) => Math.max(0, value - 1));
  };

  const goTo = (index: number) => {
    if (index === current) {
      setReview(null);
      return;
    }
    if (choices[stages[index].id]) {
      setReview(index);
    }
  };

  const seeAll = () => {
    const all: Record<string, string> = {};
    for (const s of stages) {
      const pick = s.options.find((option) => option.chosen) ?? s.options[0];
      all[s.id] = pick.id;
    }
    setChoices(all);
    setCurrent(stages.length - 1);
    setReview(null);
    setSummary(true);
  };

  const replay = () => {
    setChoices({});
    setCurrent(0);
    setReview(null);
    setSummary(false);
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      id="chapter-brief"
      className="brief-section relative overflow-hidden bg-[#1b1613] pb-12 pt-20 md:pb-16 md:pt-24"
      aria-label="Chapter 01 - The brief"
    >
      <div className="brief-glow" aria-hidden="true" />
      <div className="grain opacity-[0.045]" aria-hidden="true" />

      <div className="section-shell relative z-10">
        {/* ---------- header ---------- */}
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-3 max-w-4xl font-display text-[clamp(2.25rem,3.6vw,3.15rem)] font-semibold leading-[1.08] tracking-[-0.015em] text-ivory">
              <AccentSplit text={copy.title} accentClassName="text-sienna" />
            </h2>
            <p className="body-copy mt-4 font-body text-lead text-ivory/60">{copy.lead}</p>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4 lg:justify-self-end">
            <button
              type="button"
              onClick={seeAll}
              className="group inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/55 transition-colors duration-300 hover:text-sienna-bright"
            >
              {copy.seeAll}
              <Arrow />
            </button>
          </Reveal>
        </div>

        {summary ? (
          <Summary
            scenario={scenario}
            project={project}
            copy={copy}
            choices={choices}
            onReplay={replay}
          />
        ) : (
          <>
            {review !== null && (
              <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-olive/30 px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-olive-hi">
                {copy.reviewing} {pad(stageIndex + 1)}
                <button type="button" onClick={() => setReview(null)} className="text-sienna-bright underline-offset-2 hover:underline">
                  {copy.backToCurrent}
                </button>
              </p>
            )}

            {/* ---------- the workflow rail ---------- */}
            <Reveal delay={140}>
              <ol className="brief-rail" aria-label="The five calls">
                <span
                  aria-hidden="true"
                  className="brief-rail-fill"
                  style={{ width: `${((stageIndex + (chosen ? 1 : 0)) / stages.length) * 100}%` }}
                />
                {stages.map((s, i) => {
                  const done = Boolean(choices[s.id]);
                  const active = i === stageIndex;
                  const reachable = i <= current || done;
                  return (
                    <li key={s.id} className="brief-rail-item">
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        disabled={!reachable}
                        aria-label={`${s.stage} — step ${i + 1} of ${stages.length}`}
                        aria-current={active ? "step" : undefined}
                        className={`brief-rail-btn ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}
                      >
                        <span className="brief-rail-dot" aria-hidden="true">
                          {done && !active ? (
                            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.6">
                              <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            pad(i + 1)
                          )}
                        </span>
                        <span className="brief-rail-label">{s.stage}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </Reveal>

            {/* ---------- the table ---------- */}
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
              {/* the brief */}
              <div ref={sheetRef} className="scroll-mt-24 lg:col-span-5">
                <Reveal>
                  <div className="brief-sheet">
                  <div className="brief-meta">
                    <span className="text-sienna">{copy.meta} {scenario.briefNo}</span>
                    {project && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{project.client}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.industry}</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-[clamp(1.35rem,2vw,1.75rem)] font-semibold leading-snug text-espresso">
                    {scenario.briefTitle}
                  </h3>
                  <p className="mt-3 font-body text-[13.5px] leading-relaxed text-espresso/70">
                    {scenario.situation}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-espresso/10 pt-4">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-sienna">
                      {copy.callLabel} {pad(stageIndex + 1)} / {pad(stages.length)}
                    </p>
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso/45">
                      {stage.stage} · {stage.verb}
                    </p>
                  </div>

                  <p
                    ref={questionRef}
                    tabIndex={-1}
                    className="mt-4 font-display text-[1.0625rem] font-semibold leading-snug text-espresso outline-none"
                  >
                    {stage.question}
                  </p>

                  <div role="group" aria-label={stage.question} className="mt-3.5 space-y-2">
                    {stage.options.map((option) => {
                      const selected = chosenId === option.id;
                      const isReal = option.id === real.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => choose(option.id)}
                          disabled={review !== null}
                          aria-pressed={selected}
                          className={`brief-option group/option ${selected ? "is-selected" : ""} ${
                            isReal && selected ? "is-real" : ""
                          }`}
                        >
                          <span className="brief-option-mark" aria-hidden="true">
                            {selected ? (
                              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
                                <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <span className="brief-option-dot" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-[13.5px] font-semibold leading-snug text-espresso">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block font-body text-[11.5px] leading-snug text-espresso/55">
                              {option.hint}
                            </span>
                          </span>
                          {selected && (
                            <span className="brief-option-tag">{isReal ? copy.whatWeDid : copy.yourCall}</span>
                          )}
                          {isReal && !selected && (
                            <span className="brief-option-tag brief-option-tag-ghost">{copy.whatWeDid}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {chosen && chosen.id !== real.id && (
                    <div className="mt-4 rounded-lg border border-espresso/10 bg-espresso/[0.04] p-3">
                      <p className="font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-espresso/45">
                        {copy.whyNot}
                      </p>
                      <p className="mt-1 font-body text-[12px] leading-relaxed text-espresso/65">{chosen.verdict}</p>
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-espresso/10 pt-4">
                    <button
                      type="button"
                      onClick={back}
                      disabled={current === 0 && review === null}
                      className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-espresso/45 transition-colors hover:text-espresso disabled:opacity-30"
                    >
                      ← {copy.previous}
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      disabled={!chosen}
                      className="btn btn-primary !px-5 !py-2.5 !text-[13px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {review !== null ? copy.backToCurrent : isLast ? copy.finish : copy.next}
                      <Arrow />
                    </button>
                  </div>
                </div>
                </Reveal>
              </div>

              {/* the evidence */}
              <div ref={evidenceRef} className="scroll-mt-24 lg:col-span-7">
                <Reveal delay={100} className="h-full">
                  <div className="brief-evidence" aria-live="polite">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive/20 pb-3">
                      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                        {stage.verb} · {stage.stage}
                      </p>
                      <p className="font-body text-[10px] tabular-nums tracking-[0.16em] text-ivory/62">
                        {pad(stageIndex + 1)} / {pad(stages.length)}
                      </p>
                    </div>

                    {chosen ? (
                      <div className="brief-reveal">
                        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-olive-hi">
                            {copy.whatWeDid}
                          </p>
                          <p className="font-display text-[13px] font-semibold text-ivory/80">{real.label}</p>
                        </div>

                        <h4 className="mt-4 max-w-lg font-display text-[clamp(1.4rem,2.3vw,1.9rem)] font-semibold leading-tight text-ivory">
                          {stage.reveal.title}
                        </h4>
                        <p className="body-copy mt-3 font-body text-[13.5px] leading-relaxed text-ivory/60">
                          {stage.reveal.body}
                        </p>

                        <Artifact artifact={stage.reveal.artifact} project={project} stage={stage} />

                        {stage.reveal.metric.value && (
                          <div className="mt-5 flex items-end gap-4 border-t border-olive/20 pt-4">
                            <p className="font-display text-4xl font-semibold leading-none tracking-tight text-sienna-bright">
                              {stage.reveal.metric.value}
                            </p>
                            <p className="pb-0.5 font-body text-[11px] uppercase tracking-[0.12em] text-ivory/62">
                              {stage.reveal.metric.label}
                            </p>
                          </div>
                        )}

                        {project && (
                          <Link
                            href={`/work/${project.slug}`}
                            className="group mt-5 inline-flex items-center gap-2 font-display text-[13px] font-semibold text-sienna-bright"
                          >
                            {copy.caseCta}
                            <Arrow />
                          </Link>
                        )}

                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-olive/20 pt-4 lg:hidden">
                          <button
                            type="button"
                            onClick={back}
                            className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/62 transition-colors hover:text-ivory"
                          >
                            ← {copy.previous}
                          </button>
                          <button
                            type="button"
                            onClick={next}
                            disabled={!chosen}
                            className="btn btn-primary !px-5 !py-2.5 !text-[13px] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {review !== null ? copy.backToCurrent : isLast ? copy.finish : copy.next}
                            <Arrow />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="brief-idle">
                        <span className="brief-idle-mark" aria-hidden="true">
                          ?
                        </span>
                        <p className="mt-5 font-display text-xl font-semibold text-ivory">{copy.idleTitle}</p>
                        <p className="body-copy mt-2 max-w-sm font-body text-[13px] leading-relaxed text-ivory/62">
                          {copy.idleBody}
                        </p>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            </div>

          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Summary({
  scenario,
  project,
  copy,
  choices,
  onReplay,
}: {
  scenario: BriefScenario;
  project?: ContentProject;
  copy: BriefCopy;
  choices: Record<string, string>;
  onReplay: () => void;
}) {
  const stats = project?.stats ?? [];
  return (
    <div className="brief-summary mt-10">
      <div className="brief-summary-head">
        <div className="max-w-2xl">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
            {copy.summaryEyebrow}
          </p>
          <h3 className="mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-tight text-ivory">
            {scenario.summary.title}
          </h3>
          <p className="body-copy mt-3 font-body text-[15px] leading-relaxed text-ivory/60">
            {scenario.summary.body}
          </p>
        </div>
        <span className="brief-stamp" aria-hidden="true">
          {copy.stamp}
        </span>
      </div>

      <ol className="brief-summary-calls">
        {scenario.stages.map((stage, i) => {
          const real = stage.options.find((option) => option.chosen) ?? stage.options[0];
          const your = stage.options.find((option) => option.id === choices[stage.id]);
          const diff = your && your.id !== real.id;
          return (
            <li key={stage.id} className="brief-summary-call">
              <span className="font-body text-[10px] tabular-nums tracking-[0.16em] text-sienna-bright">
                {pad(i + 1)}
              </span>
              <div className="min-w-0">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/40">
                  {stage.stage}
                </p>
                <p className="mt-1 font-display text-[13.5px] font-semibold text-ivory">{real.label}</p>
                {diff && (
                  <p className="mt-1 font-body text-[11px] text-ivory/62">
                    {copy.yourCall}: {your.label}
                  </p>
                )}
              </div>
              <span className="font-body text-[10px] tabular-nums text-ivory/35">
                {stage.reveal.metric.value || ""}
              </span>
            </li>
          );
        })}
      </ol>

      {project && (
        <div className="brief-case">
          <div className={`relative h-40 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${project.gradient} md:h-auto md:w-56`}>
            <span
              aria-hidden="true"
              className="absolute -bottom-5 left-3 select-none font-display text-[6rem] font-semibold leading-none tracking-tight text-espresso/20"
            >
              {initials(project.client)}
            </span>
            <span className="absolute left-4 top-4 rounded-full bg-espresso/65 px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.14em] text-ivory backdrop-blur-sm">
              {project.industry}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-olive-hi">
              {project.client}
            </p>
            <p className="mt-2 font-display text-lg font-semibold leading-snug text-ivory">{project.title}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-olive/20 pt-4">
              {stats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl font-semibold leading-none tracking-tight text-sienna-bright">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 font-body text-[9px] uppercase leading-tight tracking-[0.1em] text-ivory/40">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            {project.quote && (
              <p className="mt-4 border-t border-olive/20 pt-4 font-accent text-[13px] italic leading-relaxed text-ivory/55">
                &ldquo;{project.quote}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-olive/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {project && <LinkButton href={`/work/${project.slug}`}>{copy.caseCta}</LinkButton>}
          <LinkButton href={copy.workHref} variant="secondary">
            {copy.workCta}
          </LinkButton>
        </div>
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory/62 transition-colors hover:text-sienna-bright"
        >
          {copy.replay}
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 10a6 6 0 1 1 2 4.5M4 10V6m0 4h4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Artifact({
  artifact,
  project,
  stage,
}: {
  artifact: BriefArtifact;
  project?: ContentProject;
  stage: BriefStage;
}) {
  const title = artifact.title || stage.reveal.title;
  const caption = artifact.caption;

  if (artifact.kind === "image" && artifact.src) {
    return (
      <figure className="brief-artifact mt-5 overflow-hidden">
        <Image
          src={artifact.src}
          alt={title}
          width={960}
          height={540}
          unoptimized
          className="h-auto w-full object-cover"
        />
        <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="font-display text-[12px] font-semibold text-ivory/80">{title}</span>
          <span className="font-body text-[10px] uppercase tracking-[0.12em] text-ivory/35">{caption}</span>
        </figcaption>
      </figure>
    );
  }

  if (artifact.kind === "position") {
    return (
      <div className="brief-artifact brief-artifact-position mt-5">
        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-olive-hi">The position</p>
        <p className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-tight text-ivory">
          {title}
        </p>
        <p className="mt-2 font-accent text-[13px] italic text-ivory/55">{caption}</p>
      </div>
    );
  }

  if (artifact.kind === "crest") {
    return (
      <div className="brief-artifact brief-artifact-crest mt-5">
        <span className="brief-crest" aria-hidden="true">
          {initials(project?.client ?? title)}
        </span>
        <div>
          <p className="font-display text-[13px] font-semibold text-ivory">{title}</p>
          <p className="mt-1 font-body text-[11px] uppercase tracking-[0.12em] text-ivory/40">{caption}</p>
        </div>
      </div>
    );
  }

  if (artifact.kind === "flow") {
    return (
      <div className="brief-artifact brief-artifact-flow mt-5">
        <p className="font-display text-[13px] font-semibold text-ivory">{title}</p>
        <ol className="mt-3 grid grid-cols-3 gap-2">
          {(artifact.items.length ? artifact.items : ["Ask", "Answer", "Apply"]).map((item, i) => (
            <li key={`${item}-${i}`} className="rounded-lg border border-olive/25 bg-espresso/40 p-2.5">
              <span className="font-body text-[9px] font-semibold tabular-nums tracking-[0.14em] text-sienna-bright">
                {pad(i + 1)}
              </span>
              <span className="mt-1 block font-body text-[10.5px] leading-snug text-ivory/65">{item}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 font-body text-[10px] uppercase tracking-[0.12em] text-ivory/35">{caption}</p>
      </div>
    );
  }

  if (artifact.kind === "film") {
    return (
      <div className="brief-artifact brief-artifact-film mt-5">
        <div className={`relative flex h-[200px] items-center justify-center overflow-hidden bg-gradient-to-br sm:h-[240px] ${project?.gradient ?? "from-umber via-espresso to-sienna"}`}>
          <span className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(18,14,12,0.1),rgba(18,14,12,0.75))]" aria-hidden="true" />
          <span className="brief-film-play" aria-hidden="true">
            <svg viewBox="0 0 20 20" className="ml-0.5 h-4 w-4" fill="currentColor">
              <path d="M6.5 4.2a1 1 0 0 1 1.52-.85l7.2 5.8a1 1 0 0 1 0 1.7l-7.2 5.8a1 1 0 0 1-1.52-.85z" />
            </svg>
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4">
            <span className="block font-display text-sm font-semibold text-ivory">{title}</span>
            <span className="mt-0.5 block font-body text-[9px] uppercase tracking-[0.16em] text-ivory/55">{caption}</span>
          </span>
        </div>
      </div>
    );
  }

  if (artifact.kind === "case" && project) {
    return (
      <div className="brief-artifact brief-artifact-case mt-5">
        <div className={`relative h-24 overflow-hidden rounded-lg bg-gradient-to-br ${project.gradient}`}>
          <span
            aria-hidden="true"
            className="absolute -bottom-3 left-3 select-none font-display text-[4.5rem] font-semibold leading-none tracking-tight text-espresso/20"
          >
            {initials(project.client)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-[13px] font-semibold text-ivory">{project.client}</p>
            <p className="mt-1 font-body text-[11px] uppercase tracking-[0.12em] text-ivory/40">{caption}</p>
          </div>
          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-ivory/35">{project.timeline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brief-artifact brief-artifact-note mt-5">
      <p className="font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-sienna">
        {stage.stage} note
      </p>
      <p className="mt-2 font-display text-[14px] font-semibold text-ivory">{title}</p>
      <p className="mt-1 font-body text-[10.5px] uppercase tracking-[0.12em] text-ivory/35">{caption}</p>
      {artifact.items.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-olive/20 pt-3">
          {artifact.items.map((item) => (
            <li key={item} className="flex items-start gap-2 font-body text-[11.5px] leading-snug text-ivory/60">
              <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sienna" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3);
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
