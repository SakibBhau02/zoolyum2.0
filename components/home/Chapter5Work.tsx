"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PROJECTS } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { ConfidenceIndicator } from "@/components/ui/metrics";
import { Tilt } from "@/components/ui/Tilt";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Chapter 5 - Ground We've Helped Clients Hold.
 * Featured work as positions held. Desktop: the section pins and
 * the rail traverses as the reader scrolls - five to seven
 * positions in view at once, the Signal Thread measuring progress.
 * Mobile / reduced motion: native snap scrolling, no scroll-jacking.
 */
export function Chapter5Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    fill.style.transform = `scaleX(${p})`;
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = sectionRef.current;
          const track = trackRef.current;
          const fill = fillRef.current;
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
              onUpdate: (self) => {
                if (fill) fill.style.transform = `scaleX(${self.progress})`;
              },
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

  return (
    <section
      id="chapter-work"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
      aria-label="Ground we've helped clients hold"
    >
      <div className="section-shell relative z-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow">Selected Work</p>
              <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
                Ground our clients <span className="accent-word">hold.</span>
              </h2>
              <p className="body-copy mt-5 font-body text-lead text-ivory/60">
                Every engagement is judged the same way: did the position
                strengthen - and can we prove it.
              </p>
            </div>
            <Link href="/work" className="btn-ghost font-display text-sm font-semibold text-sienna-bright">
              View all work
              <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Desktop: pinned traverse. Mobile: native snap scroll. */}
      <Reveal delay={120}>
        <div className="section-shell relative z-10">
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PROJECTS.map((project) => (
              <Tilt key={project.slug} className="w-[300px] shrink-0 snap-center md:w-[248px]">
                <Link
                  href={`/work/${project.slug}`}
                  className="card-surface group flex h-full flex-col"
                >
                  <div className={`relative h-[150px] overflow-hidden bg-gradient-to-br md:h-[165px] ${project.gradient}`}>
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-4 left-4 select-none font-display text-[5.5rem] font-semibold leading-none tracking-tight text-espresso/20"
                    >
                      {project.client.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span className="absolute left-4 top-4 rounded-full bg-espresso/60 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-widest text-ivory backdrop-blur-sm">
                      {project.industry}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                      {project.client}
                    </h3>
                    <p className="body-copy mt-1.5 line-clamp-2 font-body text-[13px] leading-relaxed text-ivory/55">
                      {project.title}
                    </p>
                    <div className="mt-auto border-t border-olive/20 pt-4">
                      <ConfidenceIndicator
                        value={project.stats[0].value}
                        label={project.stats[0].label}
                      />
                    </div>
                  </div>
                </Link>
              </Tilt>
            ))}

            <div className="card-surface flex w-[300px] shrink-0 snap-center flex-col items-start justify-center gap-6 p-8 md:w-[280px]">
              <span className="thread w-12" aria-hidden="true" />
              <div>
                <h3 className="font-display text-xl font-semibold text-ivory">
                  Your position could be next.
                </h3>
                <p className="body-copy mt-3 font-body text-sm leading-relaxed text-ivory/55">
                  Every case study here started with one conversation about
                  where the market was heading.
                </p>
              </div>
              <Link href="/contact" className="btn btn-primary !px-6 !py-3 !text-sm">
                Start a Conversation
              </Link>
            </div>
          </div>

          {/* Signal Thread progress for the traverse */}
          <div className="mt-8 hidden items-center gap-6 lg:flex" aria-hidden="true">
            <div className="relative h-[2px] flex-1 overflow-hidden bg-olive/25">
              <div
                ref={fillRef}
                className="thread h-full w-full origin-left"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <span className="font-body text-xs tracking-[0.2em] text-ivory/35">
              KEEP SCROLLING
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}