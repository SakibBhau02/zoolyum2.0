import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { WorkGallery } from "@/components/pages/WorkGallery";
import { SITE_URL } from "@/lib/data";
import { getProjects } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("work", {
    title: "Work - Case Studies with Measured Outcomes",
    description: "Case studies as positions held: education, healthcare, fashion retail, SaaS, F&B, hospitality, real estate, and e-commerce brands we've strengthened - every engagement with measured outcomes.",
    canonical: "/work",
    ogTitle: "Zoolyum Work - Case studies with measured outcomes",
    ogDescription: "Eight published positions held. Filter by industry or service - the numbers are precise on purpose.",
    card: "summary",
  });
}

const TRUST = [
  { value: "120+", label: "engagements across Bangladesh and beyond" },
  { value: "8", label: "industries where we've held positions" },
  { value: "5", label: "disciplines, one strategy system" },
];

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHero
        eyebrow="Selected Work"
        title={
          <>
            Ground our clients <span className="accent-word">hold.</span>
          </>
        }
        lead="Every engagement is judged the same way: did the position strengthen, and can we prove it. Filter by industry or service - the numbers are precise on purpose."
      />

      {/* Trust bar - instant credibility before the gallery */}
      <section className="relative border-y border-olive/15 bg-umber/40" aria-label="Practice at a glance">
        <div className="section-shell grid grid-cols-1 divide-y divide-olive/10 py-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TRUST.map((t, i) => (
            <Reveal key={t.value} delay={i * 90}>
              <div className="flex items-baseline gap-4 px-2 py-4 sm:justify-center">
                <span className="font-display text-4xl font-semibold tracking-tight text-sienna tabular-nums">
                  {t.value}
                </span>
                <span className="max-w-[220px] font-body text-sm leading-snug text-ivory/55">
                  {t.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-16" aria-label="Work gallery">
        <div className="section-shell">
          <WorkGallery projects={projects} />
        </div>
      </section>

      {/* Conversion band - the point of the page */}
      <section
        className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-20 md:py-24"
        aria-label="Start your engagement"
      >
        <div className="dappled dappled--alt" aria-hidden="true" />
        <div className="section-shell relative z-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="thread mx-auto mb-8 block w-16" aria-hidden="true" />
              <h2 className="font-display text-display-2 font-semibold text-ivory">
                Your position could be <span className="accent-word">next.</span>
              </h2>
              <p className="body-copy mx-auto mt-5 font-body text-lead text-ivory/60">
                Every case study above started the same way - one conversation
                about where the market was heading. Bring us your terrain;
                we&apos;ll tell you honestly if there&apos;s a position worth taking.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/contact" className="btn btn-primary">
                  Start a Conversation
                </Link>
                <Link href="/services" className="btn btn-secondary">
                  Explore the services
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Zoolyum Case Studies",
            itemListElement: projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Article",
                headline: `${p.client} - ${p.title}`,
                about: p.challenge,
                url: `${SITE_URL}/work/${p.slug}`,
              },
            })),
          }),
        }}
      />
    </>
  );
}