"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ContentProject } from "@/lib/content";
import type { Film } from "@/lib/data";
import { youtubeEmbed, youtubeThumb } from "@/lib/text";
import { Reveal } from "@/components/ui/Reveal";
import { AccentSplit } from "@/components/ui/AccentSplit";
import { LinkButton } from "@/components/ui/LinkButton";

export type WorkCopy = {
  eyebrow: string; title: string; lead: string; cta: string; href: string;
  reelEyebrow: string; reelNote: string; nowPlaying: string;
  channelCta: string; channelHref: string;
  casesEyebrow: string; casesNote: string; casesCta: string;
  nextTitle: string; nextText: string; nextCta: string; nextHref: string;
};

/**
 * Chapter 5 — Selected Work, rebuilt as a screening room (v7.0).
 *
 * A film-led showcase: one featured player, a short playlist, then the case
 * files underneath. The player is a facade — the YouTube iframe is only
 * mounted after a click, so eight thumbnails never cost eight embeds on
 * first paint. Films without an id render as designed posters instead of
 * broken thumbnails, which keeps the section presentable before the channel
 * is wired up.
 */
export function Chapter5Work({
  projects,
  films,
  copy,
}: {
  projects: ContentProject[];
  films: Film[];
  copy: WorkCopy;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* A facade swap removes the button the user just activated. Hand focus to
     the player so keyboard and screen-reader users land somewhere real. */
  useEffect(() => {
    if (playing) iframeRef.current?.focus({ preventScroll: true });
  }, [playing]);

  const active = films[activeIndex] ?? films[0];
  const activeProject = active ? projects.find((p) => p.slug === active.projectSlug) : undefined;
  const channel = copy.channelHref.trim();
  const cases = projects.slice(0, 4);

  const select = (index: number) => {
    setActiveIndex(index);
    setPlaying(false);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="chapter-work"
      className="chapter-work relative overflow-hidden bg-[#1b1613] py-16 md:py-24"
      aria-label="Selected work - films and case files"
    >
      <div className="grain opacity-[0.04]" aria-hidden="true" />
      <div className="chapter-work-glow" aria-hidden="true" />

      <div className="section-shell relative z-10">
        {/* ---------- header ---------- */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-7">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
              <AccentSplit text={copy.title} accentClassName="accent-word" />
            </h2>
            <p className="body-copy mt-5 font-body text-lead text-ivory/60">{copy.lead}</p>
          </Reveal>

          <Reveal delay={100} className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href={copy.href}
              className="btn-ghost group inline-flex items-center whitespace-nowrap font-display text-sm font-semibold text-sienna-bright"
            >
              {copy.cta}
              <Arrow />
            </Link>
            {channel && (
              <a
                href={channel}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/55 transition-colors duration-300 hover:text-sienna-bright"
              >
                <PlayGlyph className="h-3.5 w-3.5" />
                {copy.channelCta}
                <ExternalArrow />
              </a>
            )}
          </Reveal>
        </div>

        {/* ---------- screening room ---------- */}
        {active && (
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7">
            <div ref={playerRef} className="scroll-mt-24 lg:col-span-8">
              <Reveal>
                <div className="film-frame relative aspect-video overflow-hidden rounded-xl border border-olive/25 bg-[#120e0c]">
                  {playing && active.youtubeId ? (
                    <iframe
                      ref={iframeRef}
                      src={youtubeEmbed(active.youtubeId)}
                      title={`${active.title} — ${active.client}`}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <FeaturedPoster
                      film={active}
                      index={activeIndex}
                      project={activeProject}
                      channel={channel}
                      onPlay={() => setPlaying(true)}
                    />
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-start justify-between gap-x-8 gap-y-3" aria-live="polite">
                  <div className="min-w-0">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-sienna-bright">
                      {copy.nowPlaying}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-ivory md:text-2xl">
                      {active.title}
                    </h3>
                    <p className="body-copy mt-2 font-body text-sm leading-relaxed text-ivory/55">
                      {active.blurb}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 font-body text-[10px] uppercase tracking-[0.16em] text-ivory/55">
                    <span className="text-ivory/70">{active.client}</span>
                    <span aria-hidden="true">·</span>
                    <span>{active.kind}</span>
                    {active.duration && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{active.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120} className="lg:col-span-4">
              <div className="flex h-full flex-col rounded-xl border border-olive/20 bg-espresso/60 p-5 md:p-6">
                <div className="flex items-baseline justify-between gap-3 border-b border-olive/20 pb-4">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
                    {copy.reelEyebrow}
                  </p>
                  <span className="font-body text-[10px] tabular-nums tracking-[0.16em] text-ivory/50">
                    {String(films.length).padStart(2, "0")} FILMS
                  </span>
                </div>

                <ol className="mt-2 flex-1">
                  {films.map((film, i) => {
                    const isActive = i === activeIndex;
                    const filmProject = projects.find((p) => p.slug === film.projectSlug);
                    return (
                      <li key={`${film.title}-${i}`}>
                        <button
                          type="button"
                          onClick={() => select(i)}
                          aria-pressed={isActive}
                          className="reel-row group"
                        >
                          <span className="reel-thumb" aria-hidden="true">
                            {film.youtubeId ? (
                              <Image
                                src={youtubeThumb(film.youtubeId)}
                                alt=""
                                width={320}
                                height={180}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span
                                className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${
                                  filmProject?.gradient ?? "from-umber via-espresso to-sienna"
                                }`}
                              >
                                <span className="absolute inset-0 bg-espresso/35" aria-hidden="true" />
                                <span className="relative font-display text-[13px] font-semibold tracking-tight text-ivory/85">
                                  {film.client
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")}
                                </span>
                              </span>
                            )}
                            <span className="reel-thumb-play">
                              <PlayGlyph className="h-3 w-3" />
                            </span>
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate font-display text-[13px] font-semibold transition-colors duration-300 ${
                                isActive ? "text-sienna-bright" : "text-ivory/85 group-hover:text-ivory"
                              }`}
                            >
                              {film.title}
                            </span>
                            <span className="mt-0.5 block truncate font-body text-[10px] uppercase tracking-[0.12em] text-ivory/50">
                              {film.client}
                              <span className="hidden sm:inline"> · {film.kind}</span>
                            </span>
                          </span>

                          <span className="shrink-0 font-body text-[10px] tabular-nums text-ivory/50">
                            {film.duration || String(i + 1).padStart(2, "0")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>

                <p className="mt-4 border-t border-olive/20 pt-4 font-body text-[11px] leading-relaxed text-ivory/55">
                  {copy.reelNote}
                </p>
              </div>
            </Reveal>
          </div>
        )}

        {/* ---------- case files ---------- */}
        <div className="mt-16 border-t border-olive/20 pt-10 md:mt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <p className="eyebrow">{copy.casesEyebrow}</p>
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-ivory/50">
                {copy.casesNote}
              </p>
            </div>
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cases.map((project, i) => {
              const stat = project.stats[0];
              return (
                <Reveal key={project.slug} delay={i * 70}>
                  <Link href={`/work/${project.slug}`} className="work-case group flex h-full flex-col">
                    <div className={`work-case-art relative h-40 overflow-hidden bg-gradient-to-br ${project.gradient}`}>
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-5 left-3 select-none font-display text-[6.5rem] font-semibold leading-none tracking-tight text-espresso/20"
                      >
                        {project.client
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <span className="absolute left-4 top-4 rounded-full bg-espresso/65 px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.14em] text-ivory backdrop-blur-sm">
                        {project.industry}
                      </span>
                      <span className="absolute right-4 top-4 font-body text-[10px] tabular-nums tracking-[0.16em] text-espresso/55">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                        {project.client}
                      </h3>
                      <p className="body-copy mt-1.5 line-clamp-2 font-body text-[13px] leading-relaxed text-ivory/65">
                        {project.title}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-3 border-t border-olive/20 pt-4">
                        {stat ? (
                          <span className="min-w-0">
                            <span className="block font-display text-2xl font-semibold leading-none tracking-tight text-sienna-bright">
                              {stat.value}
                            </span>
                            <span className="mt-1.5 block truncate font-body text-[10px] uppercase tracking-[0.12em] text-ivory/55">
                              {stat.label}
                            </span>
                          </span>
                        ) : (
                          <span className="font-body text-[10px] uppercase tracking-[0.14em] text-ivory/50">
                            {copy.casesCta}
                          </span>
                        )}
                        <span className="text-ivory/50 transition-colors duration-300 group-hover:text-sienna-bright">
                          <Arrow />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ---------- closing handoff ---------- */}
        <Reveal delay={80}>
          <div className="mt-12 flex flex-col gap-6 border-t border-olive/20 pt-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h3 className="font-display text-xl font-semibold text-ivory md:text-2xl">{copy.nextTitle}</h3>
              <p className="body-copy mt-2 font-body text-sm leading-relaxed text-ivory/55">{copy.nextText}</p>
            </div>
            <LinkButton href={copy.nextHref} className="shrink-0">
              {copy.nextCta}
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FeaturedPoster({
  film,
  index,
  project,
  channel,
  onPlay,
}: {
  film: Film;
  index: number;
  project: ContentProject | undefined;
  channel: string;
  onPlay: () => void;
}) {
  const poster = (
    <>
      <span
        className={`absolute inset-0 bg-gradient-to-br ${project?.gradient ?? "from-umber via-espresso to-sienna"}`}
        aria-hidden="true"
      />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,12,0.55)_0%,rgba(18,14,12,0.15)_45%,rgba(18,14,12,0.82)_100%)]" aria-hidden="true" />
      <span className="film-poster-scan" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-10 select-none font-display text-[9rem] font-semibold leading-none tracking-tighter text-[#120e0c]/20 md:text-[15rem]"
      >
        {film.client
          .split(" ")
          .map((w) => w[0])
          .join("")}
      </span>

      <span className="relative flex h-full flex-col justify-between p-5 md:p-8">
        <span className="flex flex-wrap items-center justify-between gap-3 font-body text-[9px] font-semibold uppercase tracking-[0.24em] text-ivory/60">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sienna-bright" aria-hidden="true" />
            ZOOLYUM FILMS
          </span>
          <span>
            {film.kind}
            {film.duration ? ` · ${film.duration}` : ""}
          </span>
        </span>

        <span className="block">
          <span className="block font-display text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ivory">
            {film.title}
          </span>
          <span className="mt-2 block font-body text-xs uppercase tracking-[0.2em] text-ivory/60">
            {film.client}
          </span>
        </span>

        <span className="flex items-end justify-between gap-4">
          <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ivory/55">
            REEL {String(index + 1).padStart(2, "0")} / {film.kind}
          </span>
          {film.youtubeId ? (
            <span className="play-chip">
              <PlayGlyph className="h-3.5 w-3.5" />
              Play film
            </span>
          ) : channel ? (
            <span className="inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-sienna-bright">
              Watch on YouTube
              <ExternalArrow />
            </span>
          ) : null}
        </span>
      </span>
    </>
  );

  if (film.youtubeId) {
    return (
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play ${film.title} — ${film.client}`}
        className="group absolute inset-0 block h-full w-full cursor-pointer text-left"
      >
        <Image
          src={youtubeThumb(film.youtubeId)}
          alt=""
          width={1280}
          height={720}
          unoptimized
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,12,0.35)_0%,rgba(18,14,12,0.1)_40%,rgba(18,14,12,0.85)_100%)]" aria-hidden="true" />
        <span className="relative flex h-full items-center justify-center">
          <span className="play-disc">
            <PlayGlyph className="ml-0.5 h-5 w-5" />
          </span>
        </span>
        <span className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <span className="block font-display text-xl font-semibold text-ivory md:text-2xl">{film.title}</span>
          <span className="mt-1 block font-body text-[10px] uppercase tracking-[0.2em] text-ivory/55">
            {film.client} · {film.kind}
          </span>
        </span>
      </button>
    );
  }

  if (channel) {
    return (
      <a
        href={channel}
        target="_blank"
        rel="noreferrer"
        className="group absolute inset-0 block h-full w-full"
        aria-label={`${film.title} — watch the film on YouTube`}
      >
        {poster}
      </a>
    );
  }

  return <div className="absolute inset-0">{poster}</div>;
}

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6.5 4.2a1 1 0 0 1 1.52-.85l7.2 5.8a1 1 0 0 1 0 1.7l-7.2 5.8a1 1 0 0 1-1.52-.85z" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalArrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 14 14 6m0 0H7m7 0v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
