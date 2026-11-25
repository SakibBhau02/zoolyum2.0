"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { lockScroll, unlockScroll } from "@/lib/smooth-scroll";

/**
 * BlogFigure - an inline article image with caption and a
 * click-to-zoom lightbox (Escape / backdrop click to close).
 */
export function BlogFigure({
  src,
  caption,
  priority = false,
}: {
  src: string;
  caption: string;
  priority?: boolean;
}) {
  const [zoom, setZoom] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!zoom) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>('button, a[href]')) : [];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoom(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      previousFocus.current?.focus();
    };
  }, [zoom]);

  return (
    <figure className="my-10">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setZoom(true)}
        aria-label="Open image full-size"
        className="group block w-full overflow-hidden rounded-xl border border-olive/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sienna-bright"
      >
        <Image
          src={src}
          alt={caption}
          width={1200}
          height={800}
          unoptimized
          priority={priority}
          className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </button>
      <figcaption className="mt-3 flex items-start gap-3 font-body text-[13px] leading-relaxed text-ivory/66">
        <span aria-hidden="true" className="mt-2 h-px w-5 shrink-0 bg-sienna" />
        {caption}
      </figcaption>

      {zoom && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-espresso/95 p-6 backdrop-blur-sm md:p-12"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Close viewer"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-olive/40 text-ivory/70 transition-colors hover:border-sienna-bright hover:text-sienna-bright"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <Image
              src={src}
              alt={caption}
              width={1200}
              height={800}
              unoptimized
              className="max-h-[82vh] w-auto max-w-full rounded-xl border border-olive/30 object-contain"
            />
            <figcaption className="mt-4 text-center font-body text-xs tracking-[0.16em] text-ivory/66">
              {caption}
            </figcaption>
          </figure>
        </div>
      )}
    </figure>
  );
}