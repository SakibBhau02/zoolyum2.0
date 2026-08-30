"use client";

import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { useSound } from "@/components/layout/SoundProvider";
import { useMediaQuery } from "@/lib/hooks";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

/**
 * LinkButton — considered hover (Terrain Gradient sweep + 2px lift)
 * plus a subtle magnetic pull toward the cursor on fine pointers.
 * Plays the opt-in micro-click.
 */
export function LinkButton({ href, children, variant = "primary", className = "" }: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const { click } = useSound();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(pointer: fine)");

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || reduced || !finePointer) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    el.style.translate = `${relX * 0.18}px ${relY * 0.26}px`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.translate = "0px 0px";
  };

  return (
    <Link
      ref={ref}
      href={href}
      onClick={click}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`btn btn-${variant} ${className}`}
      style={{ transition: "translate 0.35s cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      {children}
    </Link>
  );
}
