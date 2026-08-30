import Link from "next/link";
import { Reveal, HorizonRule } from "@/components/ui/Reveal";
import { Tilt } from "@/components/ui/Tilt";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PILLARS = [
  {
    num: "01",
    title: "Brand Strategy",
    detail:
      "Positioning that claims ground no competitor can copy — identity, voice, and system in one sharpened whole.",
    href: "/services/brand-strategy",
  },
  {
    num: "02",
    title: "Digital Design",
    detail:
      "Websites and products with quiet efficiency — editorial on the surface, conversion-engineered underneath.",
    href: "/services/digital-design",
  },
  {
    num: "03",
    title: "Growth Marketing",
    detail:
      "Full-funnel campaigns aimed precisely where your buyers actually are. Every taka accountable to a metric.",
    href: "/services/growth-marketing",
  },
] as const;

/**
 * Chapter 2 — Reading the Terrain.
 * Zoolyum's role, stated plainly. The three pillars reveal with a
 * Horizon Wipe, left to right (device #4).
 */
export function Chapter2Terrain() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32" aria-label="Reading the terrain">
      <div className="dappled" aria-hidden="true" />
      <div className="section-shell relative z-10">
        <HorizonRule className="mb-16 opacity-60" />
        <Reveal>
          <SectionHeading
            eyebrow="Reading the Terrain"
            title={
              <>
                We start by reading the{" "}
                <span className="accent-word">pattern</span> everyone else is
                too busy to notice.
              </>
            }
            lead="Strategy before deliverables, always. The same three disciplines, applied in the order the market rewards."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 md:mt-20 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.num} variant="wipe" delay={i * 140}>
              <Tilt className="h-full">
              <Link href={pillar.href} className="card-surface group flex h-full flex-col p-8">
                <span className="font-display text-sm font-semibold tracking-widest text-sienna">
                  {pillar.num}
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                  {pillar.title}
                </h3>
                <p className="body-copy mt-4 flex-1 font-body text-[15px] leading-relaxed text-ivory/60">
                  {pillar.detail}
                </p>
                <span className="btn-ghost mt-6 inline-flex w-fit font-display text-sm font-semibold text-sienna-bright">
                  Explore
                  <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
