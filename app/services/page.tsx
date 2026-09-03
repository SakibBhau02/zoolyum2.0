import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES, SITE_URL } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services - Brand Strategy, Design, Growth, Content & Video",
  description:
    "Five ways Zoolyum strengthens your market position: brand strategy, digital design & UI/UX, growth marketing, content strategy, and video production. Every service told as a story - the problem you're living with, what we do about it, and what you walk away holding.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Zoolyum Services - Five ways to strengthen your position",
    description:
      "Brand strategy, digital design, growth marketing, content strategy, and video production - told as stories with proof.",
    url: "/services",
  },

  twitter: {
    card: "summary",
    title: "Zoolyum Services - Five ways to strengthen your position",
    description: "Brand strategy, digital design, growth marketing, content strategy, and video production - told as stories with proof.",
  },};

const ACTS = [
  { key: "situation", label: "The Situation", hint: "where you are" },
  { key: "noise", label: "The Noise", hint: "why it stays hard" },
  { key: "position", label: "The Position Held", hint: "what changes" },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Five ways to strengthen <span className="accent-word">your position.</span>
          </>
        }
        lead="Every service below is told the same honest way - the situation you're living with, the noise that keeps it hard, and the position we build until you hold it."
      />

      <section className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-16" aria-label="Service journeys">
        <div className="section-shell">
          <ol className="relative space-y-20 md:space-y-28">
            {/* vertical thread spine for the whole journey */}
            <span
              aria-hidden="true"
              className="absolute left-[19px] top-4 bottom-4 hidden w-[2px] bg-gradient-to-b from-sienna/50 via-olive/25 to-transparent md:block"
            />

            {SERVICES.map((service, i) => (
              <li key={service.slug} id={`service-${service.slug}`} className="relative">
                <article className="md:pl-20">
                  {/* chapter marker on the spine */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 hidden h-10 w-10 items-center justify-center rounded-full border border-sienna/40 bg-espresso font-display text-xs font-semibold text-sienna-bright md:flex"
                  >
                    0{i + 1}
                  </span>

                  {/* head */}
                  <Reveal>
                    <div className="flex flex-wrap items-end justify-between gap-6">
                      <div className="max-w-2xl">
                        <p className="eyebrow">Chapter 0{i + 1}</p>
                        <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
                          {service.name}
                        </h2>
                        <p className="mt-3 font-accent text-xl italic text-ivory/55">
                          {service.tagline}
                        </p>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="font-display text-4xl font-semibold tracking-tight text-sienna tabular-nums">
                          {service.proofStat.value}
                        </p>
                        <p className="mt-1 max-w-[180px] font-body text-xs leading-relaxed text-ivory/45">
                          {service.proofStat.label}
                        </p>
                      </div>
                    </div>
                  </Reveal>

                  {/* three acts */}
                  <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {ACTS.map((act, a) => (
                      <Reveal key={act.key} delay={a * 120}>
                        <div className="card-surface h-full p-7">
                          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/40">
                            {act.label}
                          </p>
                          <p className="mt-1 font-accent text-sm italic text-olive">
                            {act.hint}
                          </p>
                          <p className="body-copy mt-4 font-body text-[15px] leading-relaxed text-ivory/65">
                            {service[act.key]}
                          </p>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* deliverables strip + CTA */}
                  <Reveal delay={180}>
                    <div className="mt-6 flex flex-col gap-6 rounded-[0.875rem] border border-olive/15 bg-umber/30 p-7 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {service.deliverables.slice(0, 4).map((d) => (
                          <span
                            key={d}
                            className="rounded-full border border-olive/25 px-3 py-1 font-body text-xs text-ivory/60"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/services/${service.slug}`}
                        className="btn btn-primary shrink-0 !px-6 !py-3 !text-sm"
                      >
                        Read the full story
                        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>
                  </Reveal>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: SERVICES.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: s.name,
                description: s.oneParagraph,
                url: `${SITE_URL}/services/${s.slug}`,
                provider: { "@type": "Organization", name: "Zoolyum", url: SITE_URL },
              },
            })),
          }),
        }}
      />
    </>
  );
}