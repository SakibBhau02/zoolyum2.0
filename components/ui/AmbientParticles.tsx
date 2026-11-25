"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/hooks";

const COLORS = ["255, 80, 1", "255, 106, 38", "246, 241, 232"] as const;

/** Target frame budget for the ambient field — deliberately below 60fps. */
const FRAME_MS = 1000 / 30;

type Mote = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  tw: number;
  color: string;
};

/**
 * AmbientParticles — a sitewide field of slow-drifting motes on a
 * fixed canvas: the site is never perfectly still. Particles pause
 * while the reader pauses (data-reading), thin out on mobile, and
 * disappear entirely for reduced-motion users.
 *
 * Performance notes (these matter more than they look):
 *  - No `mix-blend-screen`. A full-viewport blended layer forces the
 *    compositor to re-blend the whole screen every frame, which is what
 *    made scrolling feel heavy. The motes are already additive-looking
 *    at their low alpha, so normal compositing is visually equivalent.
 *  - Capped at 30fps. Twinkling dust gains nothing from 60.
 *  - Stops entirely on a hidden tab; skips clearing while paused.
 */
export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const desktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    // No canvas on phones: a full-screen 30fps paint is not worth the battery.
    if (reduced || !desktop) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let pausedFrameDrawn = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (): Mote => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.04 + Math.random() * 0.14),
      a: 0.04 + Math.random() * 0.05,
      tw: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    resize();
    const isMobile = w < 768;
    const motes: Mote[] = Array.from({ length: isMobile ? 14 : 30 }, spawn);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;

      const paused = document.documentElement.hasAttribute("data-reading");
      if (paused && pausedFrameDrawn) return;
      pausedFrameDrawn = paused;

      ctx.clearRect(0, 0, w, h);

      for (const m of motes) {
        if (!paused) {
          m.x += m.vx;
          m.y += m.vy;
          m.tw += 0.015;
          if (m.y < -6) m.y = h + 6;
          if (m.x < -6) m.x = w + 6;
          if (m.x > w + 6) m.x = -6;
        }
        const alpha = m.a * (0.55 + 0.45 * Math.sin(m.tw));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${m.color}, ${alpha.toFixed(3)})`;
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, desktop]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
