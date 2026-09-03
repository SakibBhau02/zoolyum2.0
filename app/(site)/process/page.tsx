import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal, HorizonRule } from "@/components/ui/Reveal";
import { PROCESS_STAGES } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("process", {
    title: "Our Process",
    description: "The Zoolyum method, end to end — Discover, Strategize, Design, Launch, Grow. The same disciplined sequence on every engagement.",
    canonical: "/process",
    ogTitle: "Our Process | Zoolyum",
    ogDescription: "The Zoolyum method, end to end - Discover, Strategize, Design, Launch, Grow.",
    card: "summary",
  });
}

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="The Zoolyum Method"
        title={
          <>
            Five stages. <span className="accent-word">One line of thinking.</span>
          </>
        }
        lead="Every engagement runs the same disciplined sequence — because method is what turns projects into positions."
      />

      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Process stages">
        <div className="section-shell max-w-4xl">
          <HorizonRule className="mb-16 opacity-50" />
          <ol className="relative">
            {/* The Signal Thread drawn down the timeline */}
            <span
              aria-hidden="true"
              className="absolute left-[7px] top-2 h-[calc(100%-2rem)] w-[2px] bg-sienna md:left-[9px]"
            />
            {PROCESS_STAGES.map((stage, i) => (
              <Reveal as="li" key={stage.num} delay={i * 60} className="list-none">
                <div className="group relative pb-16 pl-10 md:pl-14">
                  <span className="absolute left-0 top-2 flex h-4 w-4 items-center justify-center md:h-5 md:w-5">
                    <span className="absolute inset-0 rounded-full border border-sienna/50 bg-espresso transition-colors duration-300 group-hover:bg-sienna" />
                    <span className="relative h-1 w-1 rounded-full bg-sienna transition-colors duration-300 group-hover:bg-espresso md:h-1.5 md:w-1.5" />
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                    <span className="font-display text-4xl font-semibold text-sienna/25 transition-colors duration-300 group-hover:text-sienna/60 md:text-5xl">
                      {stage.num}
                    </span>
                    <h2 className="font-display text-display-3 font-semibold text-ivory">
                      {stage.title}
                    </h2>
                  </div>
                  <p className="body-copy mt-4 max-w-2xl font-body text-lead leading-relaxed text-ivory/65">
                    {stage.detail}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {stage.outputs.map((output) => (
                      <span
                        key={output}
                        className="rounded-full border border-olive/30 px-4 py-1.5 font-body text-xs font-medium tracking-wide text-ivory/60"
                      >
                        {output}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={120}>
            <div className="card-surface p-9 md:p-12">
              <p className="eyebrow">Ready when you are</p>
              <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
                Somewhere in your market, there&apos;s a pattern worth finding.
              </h2>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/contact" className="btn btn-primary">
                  Start a Conversation
                </Link>
                <Link href="/work" className="btn btn-secondary">
                  See the method at work
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
