"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/hooks";
import { youtubeEmbed, youtubeThumb } from "@/lib/text";
import { lockScroll, unlockScroll } from "@/lib/smooth-scroll";

/**
 * CaseGallery - the case study's visual frames.
 * 3+ images scroll on a native snap rail with arrow controls;
 * fewer than 3 render as a grid. Hovering a frame grows it slightly;
 * clicking opens the lightbox with arrow-key navigation.
 *
 * The desktop pin + horizontal scrub this used to run added ~2 extra
 * viewports of wheel travel to every case study for the same rail.
 */
export type GalleryMedia = { src: string; alt: string; kind: "image" | "youtube"; youtubeId?: string };

export function CaseGallery({
  images,
  client,
  labels,
}: {
  images: GalleryMedia[];
  client: string;
  labels: { eyebrow: string; titleA: string; titleB: string; note: string };
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const nudge = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const step = first ? first.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // Lightbox: keyboard navigation + scroll lock
  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setLightbox((cur) =>
        cur === null ? cur : (cur + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [lightbox, close, step]);

  if (images.length === 0) return null;

  const active: GalleryMedia | null = lightbox === null ? null : images[lightbox];

  const frame = (img: GalleryMedia, i: number, tall = false) => {
    const isVideo = img.kind === "youtube" && (img.youtubeId ?? "") !== "";
    const label = img.alt || `${client} - frame ${i + 1}`;
    return (
    <button
      key={(isVideo ? (img.youtubeId ?? "") : img.src) + i}
      type="button"
      onClick={() => setLightbox(i)}
      aria-label={`Open frame ${i + 1} of ${images.length} - ${client}${isVideo ? " (video)" : ""}`}
      className={`group relative shrink-0 snap-center overflow-hidden rounded-xl border border-olive/25 bg-umber focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sienna-bright ${
        images.length >= 3 ? "w-[420px] md:w-[480px]" : "w-full"
      }`}
    >
      <div
        className={`overflow-hidden ${tall ? "aspect-[3/3.4]" : "aspect-[3/2]"}`}
      >
        {isVideo ? (
          <Image
            src={youtubeThumb(img.youtubeId as string)}
            alt={label}
            width={960}
            height={640}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <Image
            src={img.src}
            alt={label}
            width={960}
            height={640}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        )}
      </div>
      {isVideo && (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-espresso/70 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 text-ivory" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      )}
      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-espresso/70 px-3 py-1 font-body text-[11px] tracking-widest text-ivory/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        {isVideo ? "VIDEO" : "FRAME " + String(i + 1).padStart(2, "0")}
      </span>
    </button>
    );
  };

  const isTraverse = images.length >= 3;

  return (
    <section
      id="frames"
      aria-label={`${client} - the work in frames`}
      className="relative scroll-mt-32 overflow-hidden py-16 md:py-24"
    >
      <div className="section-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">{labels.eyebrow}</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
              {labels.titleA} <span className="accent-word">{labels.titleB}</span>
            </h2>
            <p className="body-copy mt-4 font-body text-lead text-ivory/60">
              {labels.note}
            </p>
          </div>
          {isTraverse && (
            <div className="flex items-center gap-4">
              <p className="hidden font-body text-xs tracking-[0.2em] text-ivory/50 lg:block">
                {reduced ? "SWIPE THE STRIP" : "DRAG OR SWIPE"}
              </p>
              <div className="hidden gap-2 md:flex">
                <RailButton label="Previous frames" onClick={() => nudge(-1)}>
                  <path d="M12 10H4m0 0 4-4m-4 4 4 4" />
                </RailButton>
                <RailButton label="Next frames" onClick={() => nudge(1)}>
                  <path d="M4 10h12m0 0-5-5m5 5-5 5" />
                </RailButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {isTraverse ? (
        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-label="Case study frames"
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden lg:px-14"
        >
          {images.map((img, i) => frame(img, i, (i + 1) % 4 === 0))}
        </div>
      ) : (
        <div className="section-shell mt-12 grid gap-6 md:grid-cols-2">
          {images.map((img, i) => frame(img, i))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${client} frame viewer`}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-espresso/95 p-4 backdrop-blur-sm md:p-10"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close viewer"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-olive/40 text-ivory/70 transition-colors hover:border-sienna-bright hover:text-sienna-bright"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Previous frame"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-olive/40 bg-espresso/70 text-ivory/80 backdrop-blur-sm transition-colors hover:border-sienna-bright hover:text-sienna-bright md:left-8"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-h-full">
            {active !== null && active.kind === "youtube" && (active.youtubeId ?? "") !== "" ? (
              <iframe
                src={youtubeEmbed(active.youtubeId as string)}
                title={`${client} - video ${lightbox + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-[min(90vw,960px)] rounded-xl border border-olive/30"
              />
            ) : (
            <Image
              src={images[lightbox].src}
              alt={images[lightbox].alt || `${client} - frame ${lightbox + 1}`}
              width={1200}
              height={800}
              unoptimized
              className="max-h-[78vh] w-auto max-w-full rounded-xl border border-olive/30 object-contain"
            />
            )}
            <figcaption className="mt-4 text-center font-body text-xs tracking-[0.2em] text-ivory/50">
              {client.toUpperCase()} - FRAME {String(lightbox + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </figcaption>
          </figure>
          <button
            type="button"
            aria-label="Next frame"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-olive/40 bg-espresso/70 text-ivory/80 backdrop-blur-sm transition-colors hover:border-sienna-bright hover:text-sienna-bright md:right-8"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-olive/40 text-ivory/70 transition-colors duration-300 hover:border-sienna-bright/60 hover:text-sienna-bright"
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}