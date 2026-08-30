"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/hooks";

const COLORS = ["201, 112, 46", "185, 148, 86", "246, 241, 232"] as const;

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
 */
export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
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

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const paused = document.documentElement.hasAttribute("data-reading");

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
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 mix-blend-screen"
    />
  );
}
