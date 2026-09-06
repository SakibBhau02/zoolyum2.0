"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { Reveal, HorizonRule } from "@/components/ui/Reveal";
import { useSound } from "@/components/layout/SoundProvider";
import { useMediaQuery } from "@/lib/hooks";

/**
 * Chapter 2 - "The Tagline", v5.9 edition.
 * The whole chapter is the tagline, told as a story in three acts:
 *   2.0 The Opener  - "Three words. The entire method."
 *   2.1 Consultancy - THE READ   (interactive: the consultant's eye
 *                    resolves noise into signal wherever it rests)
 *   2.2 Strategy    - THE MAP    (the crowd clusters; the position
 *                    is chosen on open ground)
 *   2.3 Solution    - THE BUILD  (five disciplines assemble into
 *                    one system)
 *   2.4 The Lockup  - the three words lock onto one thread.
 */

/* ----------
   v6.2 - BEFORE / AFTER compare sliders.
   Each act is one draggable divider: the problem on the left,
   the Zoolyum outcome on the right. DOM + CSS only.
   ---------- */

const STAGES = [
  { word: "Consultancy", stage: "The Read" },
  { word: "Strategy", stage: "The Map" },
  { word: "Solution", stage: "The Build" },
] as const;

/* ---------- shared: add a class once, on first view ---------- */

function useInViewClass<T extends HTMLElement>(className: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add(className);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [className]);
  return ref;
}

/* ---------- the reusable divider ---------- */

function CompareSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  initial = 50,
}: {
  before: ReactNode;
  after: ReactNode;
  beforeLabel: string;
  afterLabel: string;
  initial?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const [hinted, setHinted] = useState(false);
  const nudgeAlive = useRef(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { click } = useSound();
  const posRef = useRef(initial);

  const set = (p: number) => {
    const c = Math.max(4, Math.min(96, p));
    posRef.current = c;
    setPos(c);
  };

  /* First-view hint: the knob drifts once to say "drag me", then stops. */
  useEffect(() => {
    if (reduced || hinted) return;
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        started = true;
        nudgeAlive.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          if (!nudgeAlive.current) return;
          const k = (t - t0) / 1500;
          if (k >= 1) {
            set(initial);
            setHinted(true);
            return;
          }
          set(initial + Math.sin(k * Math.PI) * 18);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, hinted, initial]);

  /* User input always wins: kill the hint nudge the moment they take over. */
  const cancelNudge = () => {
    nudgeAlive.current = false;
    if (!hinted) setHinted(true);
  };

  const fromClientX = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    set(((clientX - r.left) / r.width) * 100);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    cancelNudge();
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      set(posRef.current - 5);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      set(posRef.current + 5);
    } else if (e.key === "Home") {
      e.preventDefault();
      set(4);
    } else if (e.key === "End") {
      e.preventDefault();
      set(96);
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={`${beforeLabel} versus ${afterLabel} - drag to compare`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* pointer capture unsupported - drag still works */
        }
        click();
        cancelNudge();
        setDragging(true);
        fromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging) fromClientX(e.clientX);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={onKeyDown}
      className="compare-track group relative h-64 cursor-ew-resize touch-pan-y select-none overflow-hidden md:h-80"
    >
      <div className="compare-after absolute inset-0">{after}</div>
      <div
        className="compare-before absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden={pos <= 4}
      >
        {before}
      </div>
      <div
        className="compare-divider absolute inset-y-0"
        style={{ left: `${pos}%` }}
        aria-hidden="true"
      >
        <span className="compare-knob">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 5 4 10l4 5M12 5l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <span className="compare-chip compare-chip-before" aria-hidden="true">Before</span>
      <span className="compare-chip compare-chip-after" aria-hidden="true">After</span>
    </div>
  );
}

/* ============ 2.1 - CONSULTANCY: noise -> signal ============ */

const READ_NOISE = [
  { text: "grow fast", top: "10%", left: "6%", size: "0.85rem", rot: "-6deg" },
  { text: "10x reach", top: "62%", left: "4%", size: "1rem", rot: "4deg" },
  { text: "synergy", top: "36%", left: "68%", size: "0.9rem", rot: "-3deg" },
  { text: "disrupt", top: "14%", left: "56%", size: "1.1rem", rot: "5deg" },
  { text: "go viral", top: "72%", left: "60%", size: "0.85rem", rot: "-5deg" },
  { text: "game-changer", top: "44%", left: "28%", size: "1rem", rot: "3deg" },
  { text: "unlock", top: "26%", left: "36%", size: "0.8rem", rot: "-4deg" },
  { text: "next-level", top: "56%", left: "40%", size: "0.9rem", rot: "6deg" },
] as const;

const READ_SIGNALS = ["Market — mapped", "Competitors — profiled", "Buyers — heard"] as const;

function ReadCompare() {
  return (
    <div>
      <div className="diagram-card p-4 md:p-6">
        <div className="diagram-glow" aria-hidden="true" />
        <CompareSlider
          beforeLabel="Noise"
          afterLabel="Signal"
          before={
            <div className="compare-scene">
              {READ_NOISE.map((w) => (
                <span
                  key={w.text}
                  className="noise-word"
                  style={{ top: w.top, left: w.left, fontSize: w.size, transform: `rotate(${w.rot})` }}
                >
                  {w.text}
                </span>
              ))}
            </div>
          }
          after={
            <div className="compare-scene compare-scene-center">
              <p className="signal-core font-display text-xl font-semibold text-ivory md:text-2xl">
                One pattern <span className="text-sienna">under the noise.</span>
              </p>
              <ul className="mt-4 space-y-2">
                {READ_SIGNALS.map((s) => (
                  <li key={s} className="flex items-center justify-center gap-2.5 font-body text-[13px] tracking-wide text-ivory/70">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-sienna" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      </div>
      <p className="mt-3.5 flex flex-wrap items-center gap-2.5 font-body text-xs leading-relaxed text-ivory/40">
        <span className="rounded-full border border-sienna/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-sienna-bright">
          Live
        </span>
        Drag the divider &mdash; wherever the consultant&apos;s eye rests, noise resolves into signal.
      </p>
    </div>
  );
}

/* ============ 2.2 - STRATEGY: crowd -> open ground ============ */

const MAP_CROWD: [number, number][] = [
  [50, 50], [56, 44], [45, 54], [52, 60], [60, 54], [43, 47],
  [58, 62], [47, 64], [54, 51], [62, 47], [41, 57], [50, 41],
  [57, 68], [46, 70],
];

function MapCompare() {
  return (
    <div>
      <div className="diagram-card p-4 md:p-6">
        <div className="diagram-glow" aria-hidden="true" />
        <CompareSlider
          beforeLabel="The crowd"
          afterLabel="The open ground"
          before={
            <div className="compare-scene">
              {MAP_CROWD.map(([l, tp], i) => (
                <span key={i} className="crowd-before-dot" style={{ left: `${l}%`, top: `${tp}%` }} />
              ))}
              <span className="compare-scene-tag" style={{ left: "50%", top: "82%" }}>The crowd</span>
            </div>
          }
          after={
            <div className="compare-scene">
              {MAP_CROWD.map(([l, tp], i) => (
                <span key={i} className="crowd-after-dot" style={{ left: `${l}%`, top: `${tp}%` }} />
              ))}
              <span className="map-flag-ring" style={{ left: "30%", top: "38%" }} />
              <span className="map-flag-pin" style={{ left: "30%", top: "38%" }} />
              <span className="compare-scene-tag compare-scene-tag-hot" style={{ left: "30%", top: "58%" }}>The open ground</span>
            </div>
          }
        />
      </div>
      <p className="mt-3.5 font-body text-xs leading-relaxed text-ivory/40">
        Everyone clusters where the noise is loudest. The defensible position is the open ground.
      </p>
    </div>
  );
}

/* ============ 2.3 - SOLUTION: parts -> system ============ */

const BUILD_CARDS = [
  { label: "IDENTITY", top: "6%", left: "5%", rot: "-8deg" },
  { label: "INTERFACE", top: "10%", left: "56%", rot: "6deg" },
  { label: "CONTENT", top: "40%", left: "30%", rot: "-5deg" },
  { label: "CAMPAIGN", top: "60%", left: "6%", rot: "7deg" },
  { label: "MOTION", top: "64%", left: "58%", rot: "-6deg" },
] as const;

const BUILD_SYSTEM = ["IDENTITY", "INTERFACE", "CONTENT", "CAMPAIGN", "MOTION"] as const;

function BuildCompare() {
  return (
    <div>
      <div className="diagram-card p-4 md:p-6">
        <div className="diagram-glow" aria-hidden="true" />
        <CompareSlider
          beforeLabel="Parts"
          afterLabel="System"
          before={
            <div className="compare-scene">
              {BUILD_CARDS.map((c) => (
                <span
                  key={c.label}
                  className="build-before-card"
                  style={{ top: c.top, left: c.left, transform: `rotate(${c.rot})` }}
                >
                  {c.label}
                </span>
              ))}
            </div>
          }
          after={
            <div className="compare-scene compare-scene-center">
              <span className="build-thread" aria-hidden="true" />
              {BUILD_SYSTEM.map((label) => (
                <span key={label} className="build-after-chip">{label}</span>
              ))}
            </div>
          }
        />
      </div>
      <p className="mt-3.5 font-body text-xs leading-relaxed text-ivory/40">
        Five disciplines, one assembled system &mdash; built in sequence, never in isolation.
      </p>
    </div>
  );
}
/* ============ the chapter ============ */

export type TaglineCopy = {
  eyebrow: string; openerA: string; openerB: string; openerSub: string;
  act1step: string; act1title: string; act1sub: string; act1body: string;
  act2step: string; act2title: string; act2sub: string; act2body: string;
  act3step: string; act3title: string; act3sub: string; act3body: string;
  lockupEyebrow: string; lockup: { word: string; stage: string }[];
  lockupNote: string; cta: string; ctaHref: string;
};

export function Chapter2Terrain({ copy }: { copy: TaglineCopy }) {
  const arrivalRef = useInViewClass<HTMLElement>("in-view");
  const act1Ref = useInViewClass<HTMLElement>("act-in");
  const act2Ref = useInViewClass<HTMLElement>("act-in");
  const act3Ref = useInViewClass<HTMLElement>("act-in");
  const finaleRef = useInViewClass<HTMLElement>("lockup-in");
  const { click } = useSound();

  const goToAct1 = () => {
    click();
    act1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ============ 2.0 - THE OPENER ============ */}
      <section
        ref={arrivalRef}
        className="arrival-card relative flex min-h-svh items-center justify-center overflow-hidden bg-espresso"
        aria-label="Chapter 02 - The tagline"
      >
        <div className="grain" aria-hidden="true" />

        <div className="section-shell relative z-10 py-28 text-center">
          <p className="ar-label mx-auto flex max-w-lg flex-wrap items-center justify-center gap-3 font-body text-[13px] font-semibold uppercase tracking-[0.08em] text-olive-hi">
            <span aria-hidden="true" className="h-px w-6 shrink-0 bg-sienna" />
            <span>{copy.eyebrow}</span>
          </p>

          <h2 className="mx-auto mt-8 font-display text-[clamp(2.5rem,5.5vw,4.75rem)] font-semibold leading-[1.08] tracking-[-0.015em]">
            <span className="ar-clause ar-clause-white block text-ivory">{copy.openerA}</span>
            <span className="ar-clause ar-clause-orange block text-sienna">{copy.openerB}</span>
          </h2>

          <p className="ar-sub body-copy mx-auto mt-7 font-body text-lead text-olive-hi">
            <span className="font-medium text-ivory/85">Consultancy<span className="text-sienna">.</span></span>{" "}
            <span className="font-medium text-ivory/85">Strategy<span className="text-sienna">.</span></span>{" "}
            <span className="font-medium text-ivory/85">Solution<span className="text-sienna">.</span></span>{" "}
            {copy.openerSub}
          </p>
        </div>

        <div className="ar-chevron absolute inset-x-0 bottom-[calc(2.5rem+env(safe-area-inset-bottom))] z-10 flex justify-center">
          <button
            type="button"
            onClick={goToAct1}
            aria-label="Continue to Consultancy"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-olive/50 text-ivory/55 transition-[border-color,color,transform] duration-200 ease-out hover:scale-105 hover:border-sienna-bright hover:text-sienna-bright"
          >
            <span className="chevron-bob block">
              <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </section>

      {/* ============ 2.1 - CONSULTANCY / THE READ ============ */}
      <section
        ref={act1Ref}
        className="act act-01 relative scroll-mt-20 overflow-hidden py-24 md:py-28"
        aria-label="Act 01 - Consultancy, the read"
      >
        <div className="section-shell grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
              {copy.act1step}
            </p>
            <h3 className="mt-4 font-display text-[clamp(2.5rem,4.5vw,4rem)] font-semibold leading-[1.05] text-ivory">
              {copy.act1title.replace(/\.$/, "")}<span className="text-sienna">.</span>
            </h3>
            <p className="mt-5 font-display text-xl font-medium leading-snug text-ivory/85 md:text-2xl">
              {copy.act1sub}
            </p>
            <p className="body-copy mt-5 font-body text-[15px] leading-relaxed text-ivory/60">
              {copy.act1body}
            </p>
          </Reveal>
          <Reveal delay={140} className="lg:col-span-7">
            <ReadCompare />
          </Reveal>
        </div>
      </section>

      {/* ============ 2.2 - STRATEGY / THE MAP ============ */}
      <section
        ref={act2Ref}
        className="act act-02 relative overflow-hidden py-24 md:py-28"
        aria-label="Act 02 - Strategy, the map"
      >
        <div className="section-shell">
          <HorizonRule className="mb-14 opacity-40" />
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <Reveal className="lg:order-2 lg:col-span-5">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
                {copy.act2step}
              </p>
              <h3 className="mt-4 font-display text-[clamp(2.5rem,4.5vw,4rem)] font-semibold leading-[1.05] text-ivory">
                {copy.act2title.replace(/\.$/, "")}<span className="text-sienna">.</span>
              </h3>
              <p className="mt-5 font-display text-xl font-medium leading-snug text-ivory/85 md:text-2xl">
                {copy.act2sub}
              </p>
              <p className="body-copy mt-5 font-body text-[15px] leading-relaxed text-ivory/60">
              {copy.act2body}
              </p>
            </Reveal>
            <Reveal delay={140} className="lg:order-1 lg:col-span-7">
              <MapCompare />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 2.3 - SOLUTION / THE BUILD ============ */}
      <section
        ref={act3Ref}
        className="act act-03 relative overflow-hidden py-24 md:py-28"
        aria-label="Act 03 - Solution, the build"
      >
        <div className="section-shell">
          <HorizonRule className="mb-14 opacity-40" />
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
                {copy.act3step}
              </p>
              <h3 className="mt-4 font-display text-[clamp(2.5rem,4.5vw,4rem)] font-semibold leading-[1.05] text-ivory">
                {copy.act3title.replace(/\.$/, "")}<span className="text-sienna">.</span>
              </h3>
              <p className="mt-5 font-display text-xl font-medium leading-snug text-ivory/85 md:text-2xl">
                {copy.act3sub}
              </p>
              <p className="body-copy mt-5 font-body text-[15px] leading-relaxed text-ivory/60">
              {copy.act3body}
              </p>
            </Reveal>
            <Reveal delay={140} className="lg:col-span-7">
              <BuildCompare />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 2.4 - THE LOCKUP ============ */}
      <section
        ref={finaleRef}
        className="lockup relative overflow-hidden pb-28 pt-24 md:pb-32"
        aria-label="The tagline, locked"
      >
        <div className="section-shell">
          <HorizonRule className="mb-14 opacity-60" />
          <Reveal>
            <p className="eyebrow">{copy.lockupEyebrow}</p>
          </Reveal>

          <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-3 md:gap-0">
            {(copy.lockup.length > 0 ? copy.lockup : STAGES).map((s, i) => (
              <div key={s.word} className="flex flex-col items-center">
                <h3 className="px-6 font-display text-[clamp(1.625rem,3vw,2.5rem)] font-semibold text-ivory">
                  {s.word.replace(/\.$/, "")}<span className="text-sienna">.</span>
                </h3>
                <div className="relative mt-6 h-3.5 w-full">
                  <span
                    className="lock-seg absolute inset-x-0 top-1/2 h-0.5 bg-sienna/40"
                    style={{ animationDelay: `${200 + i * 180}ms` }}
                    aria-hidden="true"
                  />
                  <span
                    className="lock-dot absolute left-1/2 top-1/2 h-3.5 w-3.5 rounded-full bg-sienna-bright shadow-[0_0_16px_rgba(255,80,1,0.7)]"
                    style={{ animationDelay: `${550 + i * 180}ms` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 px-6 text-center font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-olive-hi">
                  {s.stage}
                </p>
              </div>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mx-auto mt-10 max-w-xl text-center font-body text-sm leading-relaxed text-ivory/50">
              {copy.lockupNote}
            </p>
            <div className="mt-6 text-center">
              <Link
                href={copy.ctaHref}
                className="btn-ghost inline-flex font-display text-sm font-semibold text-sienna-bright"
              >
                {copy.cta}
                <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4 transition-transform duration-300 hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}