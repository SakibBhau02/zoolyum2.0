"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMediaQuery } from "@/lib/hooks";
import { LinkButton } from "@/components/ui/LinkButton";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Marketing-noise fragments — 3 depth layers x 6, no repeats. */
const FRAGMENT_LAYERS: { text: string; top: string; left: string; size: string }[][] = [
  [
    { text: "grow fast", top: "8%", left: "6%", size: "0.8125rem" },
    { text: "10x reach", top: "70%", left: "4%", size: "0.875rem" },
    { text: "unlock potential", top: "88%", left: "62%", size: "0.8125rem" },
    { text: "next-level", top: "5%", left: "64%", size: "0.875rem" },
    { text: "synergy", top: "46%", left: "88%", size: "0.8125rem" },
    { text: "think big", top: "78%", left: "30%", size: "0.8125rem" },
  ],
  [
    { text: "disrupt everything", top: "16%", left: "72%", size: "1rem" },
    { text: "stand out", top: "90%", left: "14%", size: "0.9375rem" },
    { text: "be bolder", top: "34%", left: "3%", size: "0.9375rem" },
    { text: "game-changer", top: "10%", left: "34%", size: "1.0625rem" },
    { text: "move fast", top: "6%", left: "84%", size: "0.875rem" },
    { text: "go viral", top: "62%", left: "90%", size: "0.9375rem" },
  ],
  [
    { text: "best-in-class", top: "24%", left: "56%", size: "1.125rem" },
    { text: "revolutionary", top: "58%", left: "8%", size: "1.0625rem" },
    { text: "empower", top: "84%", left: "78%", size: "1rem" },
    { text: "seamless", top: "40%", left: "92%", size: "0.9375rem" },
    { text: "innovation", top: "66%", left: "48%", size: "1.0625rem" },
    { text: "future-proof", top: "12%", left: "12%", size: "1rem" },
  ],
];

/* Abstract, generic brand-mark silhouettes — never real logos. */
const SILHOUETTES = [
  { cls: "rounded-full", top: "10%", left: "12%", size: 120, rot: 0, delay: "0s" },
  { cls: "rounded-2xl", top: "58%", left: "6%", size: 92, rot: 12, delay: "1.2s" },
  { cls: "rounded-lg", top: "16%", left: "70%", size: 112, rot: -8, delay: "2.1s" },
  { cls: "rounded-full", top: "64%", left: "76%", size: 144, rot: 0, delay: "0.7s" },
  { cls: "rounded-t-full", top: "36%", left: "40%", size: 104, rot: 18, delay: "3s" },
  { cls: "rounded-md", top: "82%", left: "44%", size: 84, rot: -14, delay: "1.6s" },
] as const;

/* Network nodes/edges — the market map that emerges in the fog.
   Coordinates mirror the silhouettes on a 1440x900 grid. */
const NODES = [
  { x: 178, y: 145 },
  { x: 125, y: 565 },
  { x: 1092, y: 198 },
  { x: 1192, y: 648 },
  { x: 632, y: 368 },
  { x: 682, y: 762 },
];
const EDGES: [number, number][] = [
  [0, 1],
  [1, 5],
  [5, 4],
  [4, 2],
  [2, 3],
  [3, 0],
  [5, 3],
  [4, 0],
];

const BEATS = ["STILL", "NOISE", "FOG", "SIGNAL"] as const;

/**
 * Chapter 1 — "The Noise" (spec 09.1), v5.1 edition.
 * A fully choreographed four-beat opening with a live noise meter,
 * beat indicator, network fog, and a comet-led Signal Thread that
 * hands off into the site-wide scroll indicator.
 */
export function Chapter1Noise() {
  const scope = useRef<HTMLDivElement>(null);
  const noiseFillRef = useRef<HTMLDivElement>(null);
  const noiseValueRef = useRef<HTMLSpanElement>(null);
  const beatsRef = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  /* Reduced-motion path: indicator active immediately. */
  useEffect(() => {
    if (reduced) {
      document.documentElement.dataset.signal = "on";
      return () => {
        delete document.documentElement.dataset.signal;
      };
    }
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const seq = scope.current?.querySelector<HTMLElement>(".ch1-seq");
        if (!seq) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: seq,
            start: "top top",
            end: "+=340%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;

              /* Signal flag → scroll indicator handoff */
              if (p > 0.92) {
                document.documentElement.dataset.signal = "on";
              } else {
                delete document.documentElement.dataset.signal;
              }

              /* Market noise meter — rises through 1b/1c, zeroes at 1d */
              let noise = 0;
              if (p <= 0.04) noise = (p / 0.04) * 0.08;
              else if (p < 0.3) noise = 0.08 + ((p - 0.04) / 0.26) * 0.4;
              else if (p < 0.6) noise = 0.48 + ((p - 0.3) / 0.3) * 0.47;
              else if (p < 0.7) noise = 0.95 * (1 - (p - 0.6) / 0.1);
              if (noiseFillRef.current) {
                noiseFillRef.current.style.transform = `scaleX(${Math.max(0, Math.min(1, noise))})`;
              }
              if (noiseValueRef.current) {
                noiseValueRef.current.textContent = `${Math.round(Math.max(0, Math.min(1, noise)) * 100)}%`;
              }

              /* Beat indicator */
              const step = p < 0.04 ? 0 : p < 0.3 ? 1 : p < 0.6 ? 2 : 3;
              const steps = beatsRef.current?.children;
              if (steps) {
                for (let i = 0; i < steps.length; i++) {
                  (steps[i] as HTMLElement).dataset.active = i === step ? "true" : "false";
                }
              }
            },
          },
        });

        /* --- Beat 1b: the noise builds --- */
        tl.fromTo(
          ".frag-layer",
          { opacity: 0 },
          { opacity: 1, duration: 0.16, stagger: 0.025, ease: "power1.out" },
          0.02
        )
          .fromTo(
            ".ch1-headline[data-beat='b']",
            { opacity: 0, y: 24, filter: "blur(5px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.1, ease: "power2.out" },
            0.04
          )
          .to(".frag-layer-0", { yPercent: -10, ease: "none", duration: 1 }, 0)
          .to(".frag-layer-1", { yPercent: -22, ease: "none", duration: 1 }, 0)
          .to(".frag-layer-2", { yPercent: -36, ease: "none", duration: 1 }, 0)

        /* --- Beat 1c: the fog thickens --- */
          .to(".ch1-headline[data-beat='b']", { opacity: 0, y: -24, filter: "blur(5px)", duration: 0.06, ease: "power2.in" }, 0.3)
          .fromTo(
            ".ch1-headline[data-beat='c']",
            { opacity: 0, y: 24, filter: "blur(5px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.09, ease: "power2.out" },
            0.35
          )
          .fromTo(".silhouette-layer", { opacity: 0 }, { opacity: 1, duration: 0.16, ease: "power1.inOut" }, 0.3)
          .fromTo(".network-layer", { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power1.inOut" }, 0.34)
          .fromTo(".ch1-grain", { opacity: 0 }, { opacity: 0.09, duration: 0.2, ease: "none" }, 0.3)
          .fromTo(".ch1-scrim", { opacity: 0.55 }, { opacity: 1, duration: 0.2, ease: "none" }, 0.28)
          .fromTo(".ch1-vignette", { opacity: 0 }, { opacity: 0.75, duration: 0.22, ease: "none" }, 0.32)

        /* --- Beat 1d: the Signal Thread --- */
          .to(".ch1-headline[data-beat='c']", { opacity: 0, y: -24, filter: "blur(5px)", duration: 0.06, ease: "power2.in" }, 0.6)
          .to(".frag-layer", { opacity: 0.05, duration: 0.14, ease: "power1.inOut" }, 0.62)
          .to(".silhouette-layer", { opacity: 0.04, duration: 0.14, ease: "power1.inOut" }, 0.62)
          .to(".network-layer", { opacity: 0.03, duration: 0.14, ease: "power1.inOut" }, 0.62)
          .to(".ch1-grain", { opacity: 0.03, duration: 0.14, ease: "none" }, 0.62)
          .to(".ch1-scrim", { opacity: 0, duration: 0.12, ease: "none" }, 0.64)
          .to(".ch1-vignette", { opacity: 0.1, duration: 0.14, ease: "none" }, 0.64)
          .fromTo(
            ".ch1-headline[data-beat='d']",
            { opacity: 0, y: 20, filter: "blur(6px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.08, ease: "power2.out" },
            0.68
          )
          /* The decisive stroke, led by a comet with a particle trail */
          .fromTo(
            ".ch1-signal",
            { scaleX: 0, opacity: 1 },
            { scaleX: 1, duration: 0.16, ease: "power2.out" },
            0.68
          )
          .fromTo(
            ".ch1-comet",
            { x: -30, opacity: 0 },
            { x: () => window.innerWidth + 30, opacity: 1, duration: 0.16, ease: "power2.out" },
            0.68
          )
          .fromTo(
            ".ch1-trail-1",
            { x: -30, opacity: 0 },
            { x: () => window.innerWidth + 30, opacity: 0.7, duration: 0.163, ease: "power2.out" },
            0.683
          )
          .fromTo(
            ".ch1-trail-2",
            { x: -30, opacity: 0 },
            { x: () => window.innerWidth + 30, opacity: 0.45, duration: 0.166, ease: "power2.out" },
            0.687
          )
          .fromTo(
            ".ch1-trail-3",
            { x: -30, opacity: 0 },
            { x: () => window.innerWidth + 30, opacity: 0.25, duration: 0.17, ease: "power2.out" },
            0.691
          )
          /* Comet exits; the line migrates up to become the indicator */
          .to(".ch1-comet, .ch1-trail-1, .ch1-trail-2, .ch1-trail-3", { opacity: 0, duration: 0.03 }, 0.85)
          .to(
            ".ch1-signal",
            { y: () => -(window.innerHeight / 2 - 2), duration: 0.1, ease: "power2.inOut" },
            0.87
          )
          .to(".ch1-signal", { opacity: 0, duration: 0.04 }, 0.97);

        return () => {
          delete document.documentElement.dataset.signal;
        };
      });

      return () => mm.revert();
    },
    { scope, dependencies: [reduced] }
  );

  /* ----------------------------------------------------------------
     Reduced-motion fallback: plain crossfades, everything readable.
     ---------------------------------------------------------------- */
  if (reduced) {
    return (
      <div ref={scope}>
        <StaticHero />
        {(["b", "c"] as const).map((beat) => (
          <section key={beat} className="relative flex min-h-[60vh] items-center overflow-hidden bg-espresso">
            <div className="section-shell relative z-10 mx-auto max-w-4xl py-20 text-center">
              <p className="font-display text-display-2 font-semibold text-ivory">
                {beat === "b"
                  ? "Most brands respond to that by shouting louder."
                  : "In the fog, most brands start to look the same."}
              </p>
            </div>
          </section>
        ))}
        <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-espresso">
          <div className="thread absolute left-0 right-0 top-1/2 opacity-80" aria-hidden="true" />
          <div className="section-shell relative z-10 mx-auto max-w-4xl py-20 text-center">
            <p className="font-display text-display-2 font-semibold text-ivory">
              In that noise, only one <span className="accent-word lit">line</span> ever cuts through.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div ref={scope}>
      {/* ============ BEAT 1a — THE HELD BREATH ============ */}
      <StaticHero />

      {/* ============ BEATS 1b-1d — PINNED SEQUENCE ============ */}
      <section className="ch1-seq relative h-svh overflow-hidden bg-espresso" aria-label="The noise, the fog, and the signal">
        {/* Background layers — masked away from the text-safe zone */}
        <div className="text-safe-mask absolute inset-0" aria-hidden="true">
          {FRAGMENT_LAYERS.map((layer, i) => (
            <div key={i} className={`frag-layer frag-layer-${i} ambient-drift absolute inset-0 opacity-0`}>
              {layer.map((frag) => (
                <span
                  key={frag.text}
                  className="ch1-fragment block"
                  style={{ top: frag.top, left: frag.left, fontSize: frag.size }}
                >
                  {frag.text}
                </span>
              ))}
            </div>
          ))}
          <div className="silhouette-layer absolute inset-0 opacity-0">
            {SILHOUETTES.map((shape, i) => (
              <span
                key={i}
                className={`ch1-silhouette ${shape.cls} hidden md:block`}
                style={{
                  top: shape.top,
                  left: shape.left,
                  width: shape.size,
                  height: shape.size,
                  transform: `rotate(${shape.rot}deg)`,
                  animationDelay: shape.delay,
                }}
              />
            ))}
          </div>
          {/* The market map — nodes and edges emerging through the fog */}
          <div className="network-layer absolute inset-0 opacity-0">
            <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
              {EDGES.map(([a, b], i) => (
                <line
                  key={i}
                  x1={NODES[a].x}
                  y1={NODES[a].y}
                  x2={NODES[b].x}
                  y2={NODES[b].y}
                  stroke="rgba(122, 122, 92, 0.28)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              ))}
              {NODES.map((n, i) => (
                <circle key={i} cx={n.x} cy={n.y} r="4" fill="rgba(255, 80, 1, 0.4)" />
              ))}
            </svg>
          </div>
        </div>

        {/* Fog vignette + dynamic scrim + intensifying grain */}
        <div className="ch1-vignette vignette absolute inset-0 opacity-0" aria-hidden="true" />
        <div className="ch1-scrim scrim absolute inset-0 opacity-0" aria-hidden="true" />
        <div className="ch1-grain grain" aria-hidden="true" style={{ opacity: 0 }} />

        {/* The Signal Thread + comet + trail (beat 1d) */}
        <div className="ch1-signal signal-line absolute left-0 right-0 top-1/2 z-30 origin-left opacity-0" aria-hidden="true" />
        <span className="ch1-comet absolute left-0 top-1/2 z-30 -mt-[5px] h-2.5 w-2.5 rounded-full bg-sienna shadow-[0_0_18px_4px_rgba(255,80,1,0.75)] opacity-0" aria-hidden="true" />
        <span className="ch1-trail-1 absolute left-0 top-1/2 z-30 -mt-[3px] h-1.5 w-1.5 rounded-full bg-sienna opacity-0" aria-hidden="true" />
        <span className="ch1-trail-2 absolute left-0 top-1/2 z-30 -mt-[2px] h-1 w-1 rounded-full bg-sienna-bright opacity-0" aria-hidden="true" />
        <span className="ch1-trail-3 absolute left-0 top-1/2 z-30 -mt-px h-0.5 w-0.5 rounded-full bg-sienna-bright opacity-0" aria-hidden="true" />

        {/* Headlines — one grid cell, crossfaded by scroll */}
        <div className="relative z-20 flex h-full items-center justify-center">
          <div className="section-shell text-center">
            <div className="grid">
              <h2 className="ch1-headline mx-auto max-w-4xl font-display text-display-2 font-semibold text-ivory" data-beat="b">
                Most brands respond to that by shouting{" "}
                <span className="text-ivory/50">louder.</span>
              </h2>
              <h2 className="ch1-headline mx-auto max-w-4xl font-display text-display-2 font-semibold text-ivory" data-beat="c">
                In the fog, most brands start to{" "}
                <span className="text-ivory/50">look the same.</span>
              </h2>
              <h2 className="ch1-headline mx-auto max-w-4xl font-display text-display-2 font-semibold text-ivory" data-beat="d">
                In that noise, only one{" "}
                <span className="text-sienna">line</span> ever cuts through.
              </h2>
            </div>
          </div>
        </div>

        {/* Market noise meter */}
        <div className="absolute bottom-8 left-6 z-20 hidden w-44 md:block" aria-hidden="true">
          <div className="flex items-baseline justify-between">
            <span className="font-body text-[10px] font-semibold tracking-[0.22em] text-ivory/40">
              MARKET NOISE
            </span>
            <span ref={noiseValueRef} className="font-display text-xs font-semibold tabular-nums text-sienna-bright">
              0%
            </span>
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-olive/25">
            <div
              ref={noiseFillRef}
              className="h-full w-full origin-left rounded-full bg-sienna"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        {/* Beat indicator */}
        <div
          ref={beatsRef}
          className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
          aria-hidden="true"
        >
          {BEATS.map((beat) => (
            <div key={beat} className="beat-step" data-active="false">
              <span className="beat-dot" />
              <span className="beat-label">{beat}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Beat 1a — the landing hero: the held breath. */
function StaticHero() {
  return (
    <section
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-espresso"
      aria-label="Consultancy. Strategy. Solution."
    >
      <HeroBackdrop />

      {/* The pulsing amber point with ripple rings */}
      <span className="pulse-wrap left-[16%] top-[26%] md:left-[21%]" aria-hidden="true">
        <span className="ripple-ring" />
        <span className="ripple-ring" />
        <span className="pulse-dot block" />
      </span>

      <div className="section-shell relative z-10 py-32 text-center">
        <p className="first-read eyebrow mx-auto inline-block" style={{ animationDelay: "150ms" }}>
          Consultancy. Strategy. Solution.
        </p>
        <h1
          className="first-read first-read-slow mx-auto mt-7 max-w-4xl font-display text-display-1 font-semibold text-ivory"
          style={{ animationDelay: "500ms" }}
        >
          Every market looks <span className="accent-word">crowded</span> from
          the outside.
        </h1>
        <p
          className="first-read body-copy mx-auto mt-7 font-body text-lead text-ivory/65"
          style={{ animationDelay: "850ms" }}
        >
          Every market has a pattern. Most brands react to it. We help you
          read it first — and act while others are still guessing.
        </p>
        <div
          className="first-read mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "1050ms" }}
        >
          <LinkButton href="/contact">Start a Conversation</LinkButton>
          <LinkButton href="/work" variant="secondary">
            See Our Work
          </LinkButton>
        </div>
      </div>

      <div
        className="first-read absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center"
        style={{ animationDelay: "1300ms" }}
        aria-hidden="true"
      >
        <p className="font-body text-[11px] font-medium tracking-[0.26em] text-ivory/35">
          THE NOISE BEGINS BELOW
        </p>
      </div>
    </section>
  );
}
