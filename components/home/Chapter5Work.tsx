import Link from "next/link";
import { PROJECTS } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { ConfidenceIndicator } from "@/components/ui/metrics";
import { Tilt } from "@/components/ui/Tilt";

/**
 * Chapter 5 — Ground We've Helped Clients Hold.
 * Featured work as positions held: a simple horizontal scroll
 * (no scroll-jacking), one quiet Confidence Indicator per card.
 */
export function Chapter5Work() {
  return (
    <section
      id="chapter-work"
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
                strengthen — and can we prove it.
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

      {/* Simple horizontal scroll (spec: no scroll-jacking) */}
      <Reveal delay={120}>
        <div className="section-shell relative z-10">
          <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PROJECTS.map((project) => (
              <Tilt key={project.slug} className="w-[300px] shrink-0 snap-center md:w-[430px]">
              <Link
                href={`/work/${project.slug}`}
                className="card-surface group block h-full"
              >
                <div className={`relative h-[210px] overflow-hidden bg-gradient-to-br md:h-[250px] ${project.gradient}`}>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-6 left-5 select-none font-display text-[9rem] font-semibold leading-none tracking-tight text-espresso/20"
                  >
                    {project.client.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <span className="absolute left-5 top-5 rounded-full bg-espresso/60 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-widest text-ivory backdrop-blur-sm">
                    {project.industry}
                  </span>
                </div>
                <div className="p-7">
                  <h3 className="font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {project.client}
                  </h3>
                  <p className="body-copy mt-2 line-clamp-2 font-body text-sm leading-relaxed text-ivory/55">
                    {project.title}
                  </p>
                  <div className="mt-6 border-t border-olive/20 pt-5">
                    <ConfidenceIndicator
                      value={project.stats[0].value}
                      label={project.stats[0].label}
                    />
                  </div>
                </div>
              </Link>
              </Tilt>
            ))}

            <div className="card-surface flex w-[300px] shrink-0 snap-center flex-col items-start justify-center gap-6 p-8 md:w-[380px]">
              <span className="thread w-12" aria-hidden="true" />
              <div>
                <h3 className="font-display text-2xl font-semibold text-ivory">
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
        </div>
      </Reveal>
    </section>
  );
}
