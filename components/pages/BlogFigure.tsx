"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom]);

  return (
    <figure className="my-10">
      <button
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
      <figcaption className="mt-3 flex items-start gap-3 font-body text-[13px] leading-relaxed text-ivory/45">
        <span aria-hidden="true" className="mt-2 h-px w-5 shrink-0 bg-sienna" />
        {caption}
      </figcaption>

      {zoom && (
        <div
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
            <figcaption className="mt-4 text-center font-body text-xs tracking-[0.16em] text-ivory/45">
              {caption}
            </figcaption>
          </figure>
        </div>
      )}
    </figure>
  );
}