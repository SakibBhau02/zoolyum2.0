"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMediaQuery } from "@/lib/hooks";

/**
 * HeroBackdrop — the cinematic ground under every hero:
 * layered gradient mesh, diagonal light rays, topographic contour
 * rings, swaying blade silhouettes, floating motes, film grain,
 * and subtle mouse parallax. All motion pauses for reduced-motion
 * users and when the reader pauses (data-reading).
 */

/* Deterministic mote field — no randomness, so SSR matches. */
const MOTES = [
  { left: "8%", top: "24%", size: 3, dur: 10, delay: 0, op: 0.55 },
  { left: "16%", top: "62%", size: 2, dur: 13, delay: -3, op: 0.4 },
  { left: "24%", top: "38%", size: 4, dur: 9, delay: -6, op: 0.6 },
  { left: "33%", top: "74%", size: 2, dur: 14, delay: -1, op: 0.35 },
  { left: "42%", top: "18%", size: 3, dur: 11, delay: -4, op: 0.5 },
  { left: "51%", top: "56%", size: 2, dur: 12, delay: -8, op: 0.45 },
  { left: "60%", top: "30%", size: 4, dur: 10, delay: -2, op: 0.55 },
  { left: "68%", top: "68%", size: 3, dur: 15, delay: -5, op: 0.4 },
  { left: "76%", top: "22%", size: 2, dur: 11, delay: -7, op: 0.5 },
  { left: "84%", top: "52%", size: 3, dur: 13, delay: -1, op: 0.45 },
  { left: "91%", top: "34%", size: 2, dur: 12, delay: -9, op: 0.4 },
  { left: "12%", top: "86%", size: 3, dur: 14, delay: -2, op: 0.35 },
  { left: "56%", top: "84%", size: 2, dur: 10, delay: -6, op: 0.35 },
  { left: "88%", top: "80%", size: 3, dur: 12, delay: -3, op: 0.3 },
] as const;

/* Blade silhouettes — tapered curved strokes at the base. */
function bladePath(x: number, h: number, lean: number, w: number) {
  const tip = x + lean;
  return `M ${x} 360 C ${x - lean * 0.15} ${360 - h * 0.4}, ${x + lean * 0.7} ${360 - h * 0.75}, ${tip} ${360 - h} C ${tip + w * 0.5} ${360 - h * 0.7}, ${x + w * 0.7} ${360 - h * 0.35}, ${x + w} 360 Z`;
}

const BACK_BLADES = [
  { x: -10, h: 290, lean: 34, w: 26 },
  { x: 70, h: 240, lean: -26, w: 22 },
  { x: 150, h: 310, lean: 42, w: 28 },
  { x: 240, h: 220, lean: -34, w: 20 },
  { x: 330, h: 300, lean: 28, w: 26 },
  { x: 430, h: 250, lean: -40, w: 24 },
  { x: 520, h: 320, lean: 36, w: 28 },
  { x: 620, h: 230, lean: -24, w: 20 },
  { x: 710, h: 300, lean: 44, w: 26 },
  { x: 810, h: 240, lean: -30, w: 22 },
  { x: 900, h: 315, lean: 32, w: 28 },
  { x: 1000, h: 235, lean: -42, w: 22 },
  { x: 1090, h: 300, lean: 26, w: 26 },
  { x: 1190, h: 245, lean: -34, w: 22 },
  { x: 1280, h: 310, lean: 38, w: 28 },
  { x: 1380, h: 230, lean: -28, w: 22 },
  { x: 1460, h: 295, lean: 40, w: 26 },
];

const FRONT_BLADES = [
  { x: 20, h: 170, lean: 26, w: 34 },
  { x: 130, h: 130, lean: -22, w: 30 },
  { x: 260, h: 185, lean: 30, w: 36 },
  { x: 390, h: 125, lean: -26, w: 30 },
  { x: 520, h: 175, lean: 24, w: 34 },
  { x: 650, h: 140, lean: -30, w: 32 },
  { x: 780, h: 180, lean: 28, w: 36 },
  { x: 910, h: 128, lean: -24, w: 30 },
  { x: 1040, h: 182, lean: 32, w: 36 },
  { x: 1170, h: 132, lean: -28, w: 32 },
  { x: 1300, h: 176, lean: 26, w: 34 },
  { x: 1420, h: 138, lean: -22, w: 30 },
];

export function HeroBackdrop({
  blades = true,
  motes = true,
  grain = true,
  className = "",
}: {
  blades?: boolean;
  motes?: boolean;
  grain?: boolean;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  /* Mouse parallax — layers drift a few pixels with the cursor */
  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const root = scope.current;
    if (!root) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-para]"));
    const movers = layers.map((el) => ({
      depth: Number(el.dataset.para ?? 0.2),
      x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
    }));

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => {
        m.x(nx * 26 * m.depth);
        m.y(ny * 18 * m.depth);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <div ref={scope} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Layer 1 — drifting gradient mesh */}
      <div className="mesh-glow absolute -inset-[12%]" data-para="0.25" />

      {/* Layer 2 — diagonal light rays */}
      <div className="rays absolute -inset-[10%]" data-para="0.15" />

      {/* Layer 3 — topographic contour rings */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-[0.05]"
        data-para="0.35"
      >
        {[110, 190, 280, 380, 495].map((r) => (
          <ellipse
            key={r}
            cx="1130"
            cy="140"
            rx={r}
            ry={r * 0.62}
            fill="none"
            stroke="#F6F1E8"
            strokeWidth="1"
          />
        ))}
        {[90, 160, 240, 330].map((r) => (
          <ellipse
            key={`b-${r}`}
            cx="120"
            cy="820"
            rx={r}
            ry={r * 0.58}
            fill="none"
            stroke="#C9702E"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Layer 4 — swaying blade silhouettes */}
      {blades && (
        <svg
          viewBox="0 0 1440 360"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-[34vh] max-h-[340px] w-full"
        >
          <g className="blade-sway" fill="#332920" opacity="0.75" data-para="0.55">
            {BACK_BLADES.map((b, i) => (
              <path key={i} d={bladePath(b.x, b.h, b.lean, b.w)} />
            ))}
          </g>
          <g className="blade-sway blade-sway-2" fill="#1D1814" data-para="0.8">
            {FRONT_BLADES.map((b, i) => (
              <path key={i} d={bladePath(b.x, b.h, b.lean, b.w)} />
            ))}
          </g>
        </svg>
      )}

      {/* Layer 5 — floating motes */}
      {motes && (
        <div className="absolute inset-0" data-para="0.65">
          {MOTES.map((m, i) => (
            <span
              key={i}
              className="mote ambient-drift"
              style={
                {
                  left: m.left,
                  top: m.top,
                  width: m.size,
                  height: m.size,
                  "--mote-duration": `${m.dur}s`,
                  "--mote-delay": `${m.delay}s`,
                  "--mote-opacity": m.op,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Layer 6 — film grain */}
      {grain && <div className="grain" />}
    </div>
  );
}
