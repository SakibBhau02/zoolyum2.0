import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROCESS_STAGES } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("about", {
    title: "About",
    description: "The story of Zoolyum — the strategic partner that turns market noise into clear competitive advantage.",
    canonical: "/about",
    ogTitle: "About | Zoolyum",
    ogDescription: "The story of Zoolyum - the strategic partner that turns market noise into clear competitive advantage.",
    card: "summary",
  });
}

const AWARDS = [
  { year: "2025", title: "Agency of the Year — Shortlist", org: "Bangladesh Digital Awards" },
  { year: "2024", title: "Gold — Brand Identity System", org: "Bangladesh Brand & Design Fest" },
  { year: "2024", title: "Best Website — E-commerce", org: "Dhaka Web Awards" },
  { year: "2023", title: "Silver — Integrated Campaign", org: "APAC Marcom Awards" },
  { year: "2022", title: "Young Achiever in Design", org: "BD Creative Circle" },
  { year: "2021", title: "Best Launch Campaign", org: "Bangladesh Marketing Summit" },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Zoolyum"
        title={
          <>
            The partner behind <span className="accent-word">the pattern-reading.</span>
          </>
        }
        lead="We started with one belief: Bangladeshi brands deserve strategy as sharp as any in Singapore, London, or New York — and the discipline to prove it works."
      />

      <section className="relative overflow-hidden py-16 md:py-24" aria-label="Our story">
        <div className="section-shell grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2 className="font-display text-display-2 font-semibold text-ivory">
              Born in Mirpur. <span className="text-ivory/55">Built for the whole market.</span>
            </h2>
            <div className="body-copy mt-8 space-y-6 font-body text-lead leading-relaxed text-ivory/65">
              <p>
                Zoolyum began in 2018 in a two-desk studio in Mirpur 11 with a
                frustration: the market was full of talented businesses with
                brilliant products — all whispering in a room full of shouting.
                Good work, invisible brands. That gap between quality and
                recognition is where we live.
              </p>
              <p>
                Eight years later we are a full team — strategists, designers,
                engineers, and filmmakers working out of the same Dhaka
                neighborhood where it started. The clients changed. The belief
                did not: a brand with sharp strategy and honest design does
                not compete in its category. It holds ground in it.
              </p>
              <p>
                We do not do decoration. Every identity, campaign, and line of
                code we ship answers to one question: does this make our
                client harder to ignore, or easier to copy?
              </p>
            </div>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-5">
            <figure className="card-surface relative flex h-full flex-col justify-between p-9">
              <span aria-hidden="true" className="absolute right-7 top-5 font-display text-7xl font-semibold leading-none text-sienna/15">
                &ldquo;
              </span>
              <blockquote className="mt-4">
                <p className="font-accent text-2xl italic leading-snug text-ivory/90">
                  A strategist&apos;s edge isn&apos;t volume. It&apos;s seeing
                  the pattern first — and moving while everyone else is still
                  reading the noise.
                </p>
              </blockquote>
              <figcaption className="mt-8 border-t border-olive/20 pt-5">
                <span className="block font-display text-sm font-semibold text-ivory">
                  The Zoolyum principle
                </span>
                <span className="mt-1 block font-body text-xs tracking-wide text-ivory/45">
                  Written on the studio wall since day one
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 md:py-24" aria-label="A note from the founder">
        <div className="section-shell">
          <Reveal>
            <div className="card-surface grid gap-10 p-9 md:grid-cols-[200px_1fr] md:p-14">
              <div>
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-sienna font-display text-3xl font-semibold text-espresso">
                  SC
                </div>
                <p className="mt-5 font-display text-base font-semibold text-ivory">Sakib Chowdhury</p>
                <p className="mt-1 font-body text-xs tracking-wide text-ivory/50">
                  Founder &amp; Creative Director
                </p>
              </div>
              <div>
                <p className="eyebrow">A note from the founder</p>
                <p className="mt-5 font-accent text-xl italic leading-relaxed text-ivory/85 md:text-2xl">
                  &ldquo;I&apos;ve watched brilliant Bangladeshi founders lose to
                  mediocre competitors with better strategy. Not anymore.
                  Bring us your ambition — we&apos;ll bring the method. The
                  market will learn your name.&rdquo;
                </p>
                <Link href="/contact" className="btn-ghost mt-7 inline-flex font-display text-sm font-semibold text-sienna-bright">
                  Talk to Sakib
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
        aria-label="The Zoolyum method"
      >
        <div className="section-shell">
          <SectionHeading
            eyebrow="The Zoolyum Method"
            title={
              <>
                Five stages. <span className="text-ivory/55">One line of thinking.</span>
              </>
            }
            lead="Every engagement runs the same disciplined sequence — the method that turns projects into positions."
          />
          <ol className="mt-14 space-y-0">
            {PROCESS_STAGES.map((stage, i) => (
              <Reveal as="li" key={stage.num} delay={i * 80} className="list-none">
                <div className="group relative grid gap-4 border-l border-olive/25 pb-12 pl-8 transition-colors duration-300 hover:border-sienna/60 md:grid-cols-[140px_220px_1fr] md:gap-8 md:pl-10">
                  <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-olive/40 bg-espresso transition-colors duration-300 group-hover:border-sienna group-hover:bg-sienna" />
                  <span className="font-display text-4xl font-semibold text-sienna/25 transition-colors duration-300 group-hover:text-sienna/60">
                    {stage.num}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-ivory">
                    {stage.title}
                  </h3>
                  <p className="body-copy max-w-xl font-body text-[15px] leading-relaxed text-ivory/60">
                    {stage.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 md:py-28" aria-label="Awards and recognition">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Awards & Recognition"
            title={
              <>
                Recognition, <span className="accent-word">earned quietly.</span>
              </>
            }
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AWARDS.map((award, i) => (
              <Reveal key={award.title} delay={i * 60}>
                <div className="card-surface group flex h-full items-start gap-5 p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-espresso font-display text-sm font-semibold text-sienna-bright ring-1 ring-sienna/40 transition-all duration-300 group-hover:bg-sienna group-hover:text-espresso">
                    {award.year}
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-semibold leading-snug text-ivory">
                      {award.title}
                    </h3>
                    <p className="mt-1.5 font-body text-xs tracking-wide text-ivory/45">
                      {award.org}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden border-t border-olive/15 py-16 md:py-20" aria-label="Keep exploring">
        <div className="section-shell flex flex-wrap items-center justify-between gap-6">
          <p className="font-display text-xl font-semibold text-ivory md:text-2xl">
            Keep exploring<span className="text-sienna">.</span>
          </p>
          <nav className="flex flex-wrap gap-3" aria-label="Related pages">
            <Link href="/team" className="btn btn-secondary">Meet the team</Link>
            <Link href="/services" className="btn btn-secondary">Explore services</Link>
            <Link href="/work" className="btn btn-secondary">See the work</Link>
          </nav>
        </div>
      </section>

    </>
  );
}
