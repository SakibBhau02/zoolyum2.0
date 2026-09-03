"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMediaQuery } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * CaseGallery - the case study's visual frames.
 * 3+ images: desktop pins and traverses horizontally on scroll;
 * mobile / reduced motion uses native snap scrolling. Hovering a
 * frame grows it slightly; clicking opens the lightbox with
 * arrow-key navigation.
 */
export function CaseGallery({
  images,
  client,
}: {
  images: { src: string; alt: string }[];
  client: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useGSAP(
    () => {
      if (images.length < 3) return;
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = sectionRef.current;
          const track = trackRef.current;
          if (!section || !track) return;

          gsap.set(track, { overflowX: "visible" });
          const distance = () =>
            Math.max(0, track.scrollWidth - window.innerWidth + 96);

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance() + window.innerHeight * 0.35}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
            gsap.set(track, { clearProps: "all" });
          };
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

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
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, step]);

  if (images.length === 0) return null;

  const frame = (img: { src: string; alt: string }, i: number, tall = false) => (
    <button
      key={img.src + i}
      type="button"
      onClick={() => setLightbox(i)}
      aria-label={`Open frame ${i + 1} of ${images.length} - ${client}`}
      className={`group relative shrink-0 snap-center overflow-hidden rounded-xl border border-olive/25 bg-umber focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sienna-bright ${
        images.length >= 3 ? "w-[420px] md:w-[480px]" : "w-full"
      }`}
    >
      <div
        className={`overflow-hidden ${tall ? "aspect-[3/3.4]" : "aspect-[3/2]"}`}
      >
        <Image
          src={img.src}
          alt={img.alt || `${client} - frame ${i + 1}`}
          width={960}
          height={640}
          unoptimized
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>
      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-espresso/70 px-3 py-1 font-body text-[11px] tracking-widest text-ivory/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        FRAME {String(i + 1).padStart(2, "0")}
      </span>
    </button>
  );

  const isTraverse = images.length >= 3;

  return (
    <section
      ref={sectionRef}
      id="frames"
      aria-label={`${client} - the work in frames`}
      className="relative scroll-mt-32 overflow-hidden py-20 md:py-28"
    >
      <div className="section-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">The frames</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
              The work, <span className="accent-word">in frames.</span>
            </h2>
            <p className="body-copy mt-4 font-body text-lead text-ivory/60">
              Hover to lean in. Click any frame to view it full-size.
            </p>
          </div>
          {isTraverse && (
            <p className="hidden font-body text-xs tracking-[0.2em] text-ivory/35 lg:block">
              {reduced ? "SWIPE THE STRIP" : "KEEP SCROLLING"}
            </p>
          )}
        </div>
      </div>

      {isTraverse ? (
        <div
          ref={trackRef}
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
            <Image
              src={images[lightbox].src}
              alt={images[lightbox].alt || `${client} - frame ${lightbox + 1}`}
              width={1200}
              height={800}
              unoptimized
              className="max-h-[78vh] w-auto max-w-full rounded-xl border border-olive/30 object-contain"
            />
            <figcaption className="mt-4 text-center font-body text-xs tracking-[0.2em] text-ivory/45">
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