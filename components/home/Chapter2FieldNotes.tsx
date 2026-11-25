"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { AccentSplit } from "@/components/ui/AccentSplit";
import { LinkButton } from "@/components/ui/LinkButton";
import { scrollToY } from "@/lib/smooth-scroll";
import type { ContentProject } from "@/lib/content";

/**
 * Chapter 02 — "Field Notes", v7.0.
 *
 * The three words, told as one continuous dossier instead of three mirrored
 * panels. The opener is the cover: the claim on the left, the index of the
 * sequence on the right. The body is a single thread with three entries, each
 * anchored to a real engagement — the read, the map, the build — and each
 * carrying the number the client was judged on. The close folds the sequence
 * back into one line and hands the reader to the work.
 */

export type FieldNoteAct = {
  kicker: string;
  word: string;
  lead: string;
  body: string;
  caseSlug: string;
  proof: string;
  proofLabel: string;
  deliverables: string[];
  linkLabel: string;
};

export type FieldNotesCopy = {
  eyebrow: string;
  openerA: string;
  openerB: string;
  openerLead: string;
  meta: string;
  indexLabel: string;
  indexNote: string;
  outcomeLabel: string;
  acts: FieldNoteAct[];
  closeEyebrow: string;
  closeLine: string;
  closeNote: string;
  cta: string;
  ctaHref: string;
  cta2: string;
  cta2Href: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chapter2FieldNotes({
  copy,
  projects,
}: {
  copy: FieldNotesCopy;
  projects: ContentProject[];
}) {
  const [active, setActive] = useState(0);
  const entryRefs = useRef<(HTMLElement | null)[]>([]);

  const findProject = (slug: string) => projects.find((p) => p.slug === slug);

  /* Highlight the aside index as each entry reaches the reading zone. */
  useEffect(() => {
    const nodes = entryRefs.current.filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = nodes.indexOf(visible.target as HTMLElement);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0, 0.25, 0.6] },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [copy.acts.length]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const target = entryRefs.current[index];
    if (!target) return;
    event.preventDefault();
    const top = window.scrollY + target.getBoundingClientRect().top - 88;
    scrollToY(top);
    setActive(index);
  };

  return (
    <>
      {/* ============ THE COVER ============ */}
      <section
        className="notes-cover relative overflow-hidden border-y border-olive/15 bg-espresso"
        aria-label="Chapter 02 - Field notes"
      >
        <div className="grain" aria-hidden="true" />
        <div className="notes-cover-glow" aria-hidden="true" />

        <div className="section-shell relative z-10 py-16 md:py-24">
          <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="eyebrow">{copy.eyebrow}</p>
              </Reveal>
              <Reveal delay={90}>
                <h2 className="mt-7 font-display text-[clamp(2.75rem,5.4vw,5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ivory">
                  <span className="block">{copy.openerA}</span>
                  <span className="block text-sienna">{copy.openerB}</span>
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="body-copy mt-7 font-body text-lead text-ivory/65">{copy.openerLead}</p>
              </Reveal>
              <Reveal delay={220}>
                <p className="mt-9 flex items-center gap-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/55">
                  <span aria-hidden="true" className="h-px w-10 shrink-0 bg-sienna/80" />
                  {copy.meta}
                </p>
              </Reveal>
            </div>

            <Reveal delay={140} className="lg:col-span-5">
              <div className="notes-index">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-olive-hi">
                    {copy.indexLabel}
                  </p>
                  <span className="font-body text-[10px] font-semibold tabular-nums tracking-[0.18em] text-ivory/62">
                    {pad(copy.acts.length)}
                  </span>
                </div>

                <ol className="mt-5">
                  {copy.acts.map((act, i) => {
                    const project = findProject(act.caseSlug);
                    const isActive = i === active;
                    return (
                      <li key={`${act.word}-${i}`}>
                        <a
                          href={`#note-${i + 1}`}
                          onClick={(event) => jump(event, i)}
                          aria-current={isActive ? "true" : undefined}
                          className="notes-index-row group"
                        >
                          <span className="notes-index-rail" aria-hidden="true">
                            <span className={`notes-index-node ${isActive ? "is-active" : ""}`} />
                          </span>
                          <span className="notes-index-step">{pad(i + 1)}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-lg font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                              {act.word.replace(/\.$/, "")}
                              <span className="text-sienna">.</span>
                            </span>
                            <span className="mt-0.5 block truncate font-body text-[11px] uppercase tracking-[0.14em] text-ivory/55">
                              {act.kicker}
                              {project ? ` · ${project.client}` : ""}
                            </span>
                          </span>
                          <span className="text-ivory/30 transition-colors duration-300 group-hover:text-sienna-bright">
                            <Arrow />
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>

                <p className="mt-5 border-t border-olive/20 pt-4 font-body text-xs leading-relaxed text-ivory/55">
                  {copy.indexNote}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ THE ENTRIES ============ */}
      <section className="notes-body relative bg-espresso pb-6" aria-label="The three moves in sequence">
        <div className="section-shell">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-28">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-olive-hi">
                  {copy.indexLabel}
                </p>
                <ol className="mt-6 space-y-5">
                  {copy.acts.map((act, i) => (
                    <li key={`rail-${act.word}`} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                          i === active
                            ? "bg-sienna-bright shadow-[0_0_12px_rgba(255,80,1,0.8)]"
                            : "bg-olive/45"
                        }`}
                      />
                      <a
                        href={`#note-${i + 1}`}
                        onClick={(event) => jump(event, i)}
                        className={`font-body text-sm transition-colors duration-300 ${
                          i === active ? "text-ivory" : "text-ivory/55 hover:text-ivory/80"
                        }`}
                      >
                        {act.word.replace(/\.$/, "")}
                      </a>
                      <span className="ml-auto font-body text-[10px] tabular-nums tracking-[0.14em] text-ivory/62">
                        {pad(i + 1)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            <div className="relative lg:col-span-9">
              <div className="notes-thread" aria-hidden="true" />

              {copy.acts.map((act, i) => {
                const project = findProject(act.caseSlug);
                const proof = act.proof.trim();
                return (
                  <article
                    key={`${act.word}-${i}`}
                    id={`note-${i + 1}`}
                    ref={(el) => {
                      entryRefs.current[i] = el;
                    }}
                    className="notes-entry relative scroll-mt-24 pb-16 last:pb-8 md:pl-12"
                  >
                    <span className="notes-entry-node" aria-hidden="true" />

                    <Reveal>
                      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-olive/20 pb-4">
                        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-sienna-bright">
                          {pad(i + 1)} <span className="text-ivory/30">/</span> {act.kicker}
                        </p>
                        {project && (
                          <Link
                            href={`/work/${project.slug}`}
                            className="group inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.14em] text-ivory/60 transition-colors duration-300 hover:text-sienna-bright"
                          >
                            <span className="text-ivory/80">{project.client}</span>
                            <span className="text-ivory/62" aria-hidden="true">·</span>
                            <span>{project.industry}</span>
                            <Arrow />
                          </Link>
                        )}
                      </header>
                    </Reveal>

                    <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                      <div className="lg:col-span-7">
                        <Reveal>
                          <h3 className="font-display text-[clamp(2.4rem,4.4vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.015em] text-ivory">
                            {act.word.replace(/\.$/, "")}
                            <span className="text-sienna">.</span>
                          </h3>
                        </Reveal>
                        <Reveal delay={80}>
                          <p className="mt-4 max-w-xl font-display text-xl font-medium leading-snug text-ivory/85 md:text-2xl">
                            {act.lead}
                          </p>
                        </Reveal>
                        <Reveal delay={140}>
                          <p className="body-copy mt-5 font-body text-[15px] leading-relaxed text-ivory/60">
                            {act.body}
                          </p>
                        </Reveal>
                        {act.deliverables.length > 0 && (
                          <Reveal delay={200}>
                            <ul className="mt-6 flex flex-wrap gap-2">
                              {act.deliverables.map((item) => (
                                <li
                                  key={item}
                                  className="rounded-full border border-olive/30 px-3 py-1 font-body text-[11px] font-medium tracking-wide text-ivory/65"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </Reveal>
                        )}
                      </div>

                      <Reveal delay={160} className="lg:col-span-5">
                        <div className="notes-proof">
                          {proof && (
                            <>
                              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
                                {copy.outcomeLabel}
                              </p>
                              <p className="mt-3 font-display text-[clamp(2.25rem,3.4vw,3.25rem)] font-semibold leading-none tracking-tight text-sienna-bright">
                                {proof}
                              </p>
                              <p className="mt-3 font-body text-[13px] leading-relaxed text-ivory/60">
                                {act.proofLabel}
                              </p>
                            </>
                          )}

                          {project?.quote && (
                            <blockquote className="mt-6 border-t border-olive/20 pt-5">
                              <p className="font-accent text-[15px] italic leading-relaxed text-ivory/70">
                                &ldquo;{project.quote}&rdquo;
                              </p>
                              {project.quoteAuthor && (
                                <footer className="mt-3 font-body text-[10px] uppercase tracking-[0.16em] text-ivory/62">
                                  {project.quoteAuthor}
                                </footer>
                              )}
                            </blockquote>
                          )}

                          {project && (
                            <Link
                              href={`/work/${project.slug}`}
                              className="group mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-sienna-bright"
                            >
                              {act.linkLabel}
                              <Arrow />
                            </Link>
                          )}
                        </div>
                      </Reveal>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ THE CLOSE ============ */}
      <section
        className="notes-close terrain-gradient-soft relative overflow-hidden border-y border-olive/15"
        aria-label="The sequence, end to end"
      >
        <div className="grain opacity-[0.05]" aria-hidden="true" />
        <div className="section-shell relative z-10 py-16 text-center md:py-20">
          <Reveal>
            <p className="eyebrow mx-auto inline-block">{copy.closeEyebrow}</p>
            <h2 className="mx-auto mt-6 max-w-4xl font-display text-display-1 font-semibold text-ivory">
              <AccentSplit text={copy.closeLine} accentClassName="text-sienna" />
            </h2>
            <p className="body-copy mx-auto mt-6 font-body text-[15px] leading-relaxed text-ivory/60">
              {copy.closeNote}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <LinkButton href={copy.ctaHref}>{copy.cta}</LinkButton>
              <LinkButton href={copy.cta2Href} variant="secondary">
                {copy.cta2}
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
