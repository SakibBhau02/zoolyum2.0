"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * ThreadCursor — the Signal Thread made physical: a fine sienna
 * line that rotates to track movement direction and expands into
 * a three-stroke mark over interactive elements. Fine pointers
 * only; reduced-motion users get a soft dot.
 */
export function ThreadCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const finePointer = useMediaQuery("(pointer: fine)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const el = cursorRef.current;
    if (!el || !finePointer) return;

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let angle = 90;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      const target = e.target as HTMLElement | null;
      const hovering = !!target?.closest?.(
        "a, button, [role='button'], input, textarea, select, label, summary"
      );
      el.dataset.hover = hovering ? "true" : "false";
    };

    const onDown = () => {
      el.dataset.pressed = "true";
    };
    const onUp = () => {
      el.dataset.pressed = "false";
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    const render = () => {
      if (reduced) {
        x = tx;
        y = ty;
      } else {
        x += (tx - x) * 0.22;
        y += (ty - y) * 0.22;
        const dx = tx - x;
        const dy = ty - y;
        if (Math.abs(dx) + Math.abs(dy) > 1.5) {
          const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          let delta = target - angle;
          while (delta > 180) delta -= 360;
          while (delta < -180) delta += 360;
          angle += delta * 0.2;
        }
      }
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.style.setProperty("--angle", `${reduced ? 0 : angle}deg`);
      raf = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [finePointer, reduced]);

  if (!finePointer) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      data-hover="false"
      data-pressed="false"
      className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 transition-opacity duration-300"
    >
      <div className="cursor-core">
        <span className="cursor-bar" />
        <span className="cursor-bar" />
        <span className="cursor-bar" />
      </div>
      <style>{`
        .cursor-core {
          position: relative;
          width: 34px;
          height: 34px;
          margin: -17px 0 0 -17px;
          transform: rotate(var(--angle, 90deg));
          transition: transform 0.15s ease-out;
        }
        .cursor-bar {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          height: 26px;
          margin: -13px 0 0 -1px;
          border-radius: 2px;
          background: linear-gradient(180deg, #ce7a34, #b99456);
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cursor-bar:nth-child(1),
        .cursor-bar:nth-child(3) {
          opacity: 0;
          transform: scaleX(0);
        }
        [data-hover='true'] .cursor-core {
          transform: rotate(-32deg);
        }
        [data-hover='true'] .cursor-bar {
          height: 18px;
          margin: -9px 0 0 -1px;
        }
        [data-hover='true'] .cursor-bar:nth-child(1) {
          opacity: 1;
          transform: translateX(-7px) scaleX(1);
        }
        [data-hover='true'] .cursor-bar:nth-child(3) {
          opacity: 1;
          transform: translateX(7px) scaleX(1);
        }
        [data-hover='true'] .cursor-bar:nth-child(2) {
          transform: translateX(0) scaleX(1);
        }
        [data-pressed='true'] .cursor-core {
          scale: 0.75;
        }
        @media (prefers-reduced-motion: reduce) {
          .cursor-core { transform: none; }
          .cursor-bar { height: 9px; margin: -4.5px 0 0 -1px; }
        }
      `}</style>
    </div>
  );
}
