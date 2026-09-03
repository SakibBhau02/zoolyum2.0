"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMediaQuery } from "@/lib/hooks";

/**
 * HeroBackdrop - the cinematic ground under every hero:
 * layered gradient mesh, diagonal light rays, topographic contour
 * rings, a three-depth jungle of blade silhouettes with thin
 * stroke outlines, glowing leaf stalks, blinking fireflies,
 * floating motes, film grain, and subtle mouse parallax.
 * All motion pauses for reduced-motion users and when the
 * reader pauses (data-reading).
 */

/* Deterministic mote field - no randomness, so SSR matches. */
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

/* Fireflies - brighter, blink as they drift. */
const FIREFLIES = [
  { left: "14%", top: "72%", size: 4, dur: 9, delay: -2, ff: 4.6 },
  { left: "27%", top: "58%", size: 3, dur: 12, delay: -6, ff: 5.8 },
  { left: "38%", top: "80%", size: 4, dur: 10, delay: -1, ff: 5.2 },
  { left: "49%", top: "66%", size: 3, dur: 13, delay: -8, ff: 6.4 },
  { left: "61%", top: "78%", size: 4, dur: 11, delay: -4, ff: 4.9 },
  { left: "73%", top: "60%", size: 3, dur: 14, delay: -7, ff: 5.6 },
  { left: "85%", top: "74%", size: 4, dur: 10, delay: -3, ff: 6.1 },
] as const;

/* Blade silhouettes - tapered curved strokes at the base. */
function bladePath(x: number, h: number, lean: number, w: number) {
  const tip = x + lean;
  return `M ${x} 360 C ${x - lean * 0.15} ${360 - h * 0.4}, ${x + lean * 0.7} ${360 - h * 0.75}, ${tip} ${360 - h} C ${tip + w * 0.5} ${360 - h * 0.7}, ${x + w * 0.7} ${360 - h * 0.35}, ${x + w} 360 Z`;
}

/* Midrib - the leaf's stalk, drawn tip-to-base so the glow
   runner travels downward with the dash offset. */
function midribPath(x: number, h: number, lean: number, w: number) {
  const tip = x + lean;
  return `M ${tip} ${360 - h} C ${x + lean * 0.62} ${360 - h * 0.72}, ${x + lean * 0.12} ${360 - h * 0.38}, ${x + w * 0.35} 360`;
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

const MID_BLADES = [
  { x: 40, h: 210, lean: 30, w: 24 },
  { x: 190, h: 175, lean: -28, w: 20 },
  { x: 340, h: 225, lean: 34, w: 24 },
  { x: 500, h: 185, lean: -32, w: 22 },
  { x: 660, h: 220, lean: 30, w: 24 },
  { x: 830, h: 180, lean: -26, w: 20 },
  { x: 990, h: 230, lean: 36, w: 24 },
  { x: 1150, h: 190, lean: -30, w: 22 },
  { x: 1310, h: 225, lean: 32, w: 24 },
  { x: 1440, h: 185, lean: -26, w: 20 },
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

/* Which stalks carry the traveling glow, and on what rhythm. */
const BACK_RUNNERS = [
  { i: 2, dur: 9.5, delay: -2 },
  { i: 5, dur: 11, delay: -7 },
  { i: 8, dur: 8.5, delay: -4.5 },
  { i: 11, dur: 12, delay: -9 },
  { i: 14, dur: 10, delay: -0.5 },
];
const MID_RUNNERS = [
  { i: 1, dur: 10, delay: -5 },
  { i: 4, dur: 8, delay: -1.5 },
  { i: 6, dur: 11.5, delay: -8 },
  { i: 9, dur: 9.5, delay: -3 },
];
const FRONT_RUNNERS = [
  { i: 0, dur: 7.5, delay: -1 },
  { i: 3, dur: 10.5, delay: -6.5 },
  { i: 7, dur: 8.5, delay: -3.5 },
  { i: 10, dur: 12, delay: -10 },
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
  const bladesSvgRef = useRef<SVGSVGElement>(null);
  const torchRef = useRef<SVGEllipseElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  /* Mouse parallax - layers drift a few pixels with the cursor */
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

  /* Torch glow - blades near the cursor light up in sienna. The
     glow layer is a masked duplicate of every blade; a lerped rAF
     loop eases the mask ellipse toward the pointer while the hero
     is on screen. Fine pointers only; skipped when reduced. */
  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const svg = bladesSvgRef.current;
    const torch = torchRef.current;
    if (!svg || !torch) return;

    const glowGroups = Array.from(
      svg.querySelectorAll<SVGGElement>(".blade-glow"),
    );

    let raf = 0;
    let running = false;
    let onScreen = false;
    let glowVisible = false;
    const cur = { x: -500, y: -500, o: 0 };
    const tgt = { x: -500, y: -500, o: 0 };

    const apply = (vis: boolean) => {
      if (vis === glowVisible) return;
      glowVisible = vis;
      glowGroups.forEach((g) => {
        g.style.visibility = vis ? "visible" : "hidden";
      });
    };

    const tick = () => {
      cur.x += (tgt.x - cur.x) * 0.1;
      cur.y += (tgt.y - cur.y) * 0.1;
      cur.o += (tgt.o - cur.o) * 0.075;
      torch.setAttribute("cx", cur.x.toFixed(1));
      torch.setAttribute("cy", cur.y.toFixed(1));
      torch.setAttribute("opacity", cur.o.toFixed(3));
      apply(cur.o > 0.02);
      if (running) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !running) {
        tgt.o = 0;
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!onScreen) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(svg);

    const onMove = (e: PointerEvent) => {
      if (!onScreen) return;
      const r = svg.getBoundingClientRect();
      tgt.x = ((e.clientX - r.left) / r.width) * 1440;
      tgt.y = ((e.clientY - r.top) / r.height) * 360;
      const near =
        e.clientX >= r.left - 70 &&
        e.clientX <= r.right + 70 &&
        e.clientY >= r.top - 90 &&
        e.clientY <= r.bottom + 30;
      tgt.o = near ? 1 : 0;
    };
    const onLeaveWindow = (e: PointerEvent) => {
      if (!e.relatedTarget) tgt.o = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeaveWindow);
    return () => {
      io.disconnect();
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeaveWindow);
    };
  }, [reduced]);

  return (
    <div ref={scope} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Layer 1 - drifting gradient mesh */}
      <div className="mesh-glow absolute -inset-[12%]" data-para="0.25" />

      {/* Layer 2 - diagonal light rays */}
      <div className="rays absolute -inset-[10%]" data-para="0.15" />

      {/* Layer 3 - topographic contour rings */}
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
            stroke="#FF5001"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Layer 4 - the jungle: three blade depths, thin stroke
          outlines on every leaf, a faint stalk inside each, and
          amber glow pulses that run down the stalks. Strokes and
          stalks live in the same sway group as their leaves, so
          the whole leaf moves as one. */}
      {blades && (
        <svg
          ref={bladesSvgRef}
          viewBox="0 0 1440 360"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-[34vh] max-h-[340px] w-full"
        >
          <defs>
            <radialGradient id="hero-torch-grad">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="75%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <mask
              id="hero-torch-mask"
              maskUnits="userSpaceOnUse"
              x="-80"
              y="-80"
              width="1600"
              height="520"
            >
              <ellipse
                ref={torchRef}
                cx="-500"
                cy="-500"
                rx="240"
                ry="210"
                fill="url(#hero-torch-grad)"
                opacity="0"
              />
            </mask>
          </defs>
          <g className="blade-sway" data-para="0.55">
            {BACK_BLADES.map((b, i) => (
              <path
                key={`bb-${i}`}
                d={bladePath(b.x, b.h, b.lean, b.w)}
                fill="#332920"
                fillOpacity="0.75"
                stroke="rgba(246,241,232,0.1)"
                strokeWidth="1"
              />
            ))}
            {BACK_BLADES.map((b, i) => (
              <path key={`bs-${i}`} d={midribPath(b.x, b.h, b.lean, b.w)} className="stalk" fill="none" />
            ))}
            {BACK_RUNNERS.map(({ i, dur, delay }) => {
              const b = BACK_BLADES[i];
              return (
                <path
                  key={`br-${i}`}
                  d={midribPath(b.x, b.h, b.lean, b.w)}
                  className="stalk-run"
                  fill="none"
                  style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
                />
              );
            })}
            {!reduced && (
              <g className="blade-glow" mask="url(#hero-torch-mask)">
                {BACK_BLADES.map((b, i) => (
                  <path key={`bglow-${i}`} d={bladePath(b.x, b.h, b.lean, b.w)} />
                ))}
              </g>
            )}
          </g>

          <g className="blade-sway blade-sway-3" data-para="0.7">
            {MID_BLADES.map((b, i) => (
              <path
                key={`mb-${i}`}
                d={bladePath(b.x, b.h, b.lean, b.w)}
                fill="#2A221B"
                stroke="rgba(246,241,232,0.13)"
                strokeWidth="1"
              />
            ))}
            {MID_BLADES.map((b, i) => (
              <path key={`ms-${i}`} d={midribPath(b.x, b.h, b.lean, b.w)} className="stalk" fill="none" />
            ))}
            {MID_RUNNERS.map(({ i, dur, delay }) => {
              const b = MID_BLADES[i];
              return (
                <path
                  key={`mr-${i}`}
                  d={midribPath(b.x, b.h, b.lean, b.w)}
                  className="stalk-run"
                  fill="none"
                  style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
                />
              );
            })}
            {!reduced && (
              <g className="blade-glow" mask="url(#hero-torch-mask)">
                {MID_BLADES.map((b, i) => (
                  <path key={`mglow-${i}`} d={bladePath(b.x, b.h, b.lean, b.w)} />
                ))}
              </g>
            )}
          </g>

          <g className="blade-sway blade-sway-2" data-para="0.8">
            {FRONT_BLADES.map((b, i) => (
              <path
                key={`fb-${i}`}
                d={bladePath(b.x, b.h, b.lean, b.w)}
                fill="#1D1814"
                stroke="rgba(246,241,232,0.16)"
                strokeWidth="1"
              />
            ))}
            {FRONT_BLADES.map((b, i) => (
              <path key={`fs-${i}`} d={midribPath(b.x, b.h, b.lean, b.w)} className="stalk" fill="none" />
            ))}
            {FRONT_RUNNERS.map(({ i, dur, delay }) => {
              const b = FRONT_BLADES[i];
              return (
                <path
                  key={`fr-${i}`}
                  d={midribPath(b.x, b.h, b.lean, b.w)}
                  className="stalk-run"
                  fill="none"
                  style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
                />
              );
            })}
            {!reduced && (
              <g className="blade-glow" mask="url(#hero-torch-mask)">
                {FRONT_BLADES.map((b, i) => (
                  <path key={`fglow-${i}`} d={bladePath(b.x, b.h, b.lean, b.w)} />
                ))}
              </g>
            )}
          </g>
        </svg>
      )}

      {/* Layer 5 - fireflies among the leaves */}
      <div className="absolute inset-0" data-para="0.75">
        {FIREFLIES.map((f, i) => (
          <span
            key={`ff-${i}`}
            className="firefly"
            style={
              {
                left: f.left,
                top: f.top,
                width: f.size,
                height: f.size,
                "--mote-duration": `${f.dur}s`,
                "--mote-delay": `${f.delay}s`,
                "--ff-duration": `${f.ff}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Layer 6 - floating motes */}
      {motes && (
        <div className="absolute inset-0" data-para="0.65">
          {MOTES.map((m, i) => (
            <span
              key={`m-${i}`}
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

      {/* Layer 7 - film grain */}
      {grain && <div className="grain" />}
    </div>
  );
}