import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { WorkGallery } from "@/components/pages/WorkGallery";
import { SITE_URL } from "@/lib/data";
import { getProjects, getWorkCopy, getWorkTrust } from "@/lib/content";

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

export default async function WorkPage() {
  const [projects, w, trust] = await Promise.all([getProjects(), getWorkCopy(), getWorkTrust()]);
  return (
    <>
      <PageHero
        eyebrow={w["work.page.eyebrow"]}
        title={
          <>
            {w["work.page.titleA"]} <span className="accent-word">{w["work.page.titleB"]}</span>
          </>
        }
        lead={w["work.page.lead"]}
      />

      {/* Trust bar - instant credibility before the gallery */}
      <section className="relative border-y border-olive/15 bg-umber/40" aria-label="Practice at a glance">
        <div className="section-shell grid grid-cols-1 divide-y divide-olive/10 py-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {trust.map((t, i) => (
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
          <WorkGallery
            projects={projects}
            ui={{
              filter: w["work.ui.filter"],
              all: w["work.ui.all"],
              industry: w["work.ui.industry"],
              service: w["work.ui.service"],
              showingA: w["work.ui.showingA"],
              showingB: w["work.ui.showingB"],
              showingC: w["work.ui.showingC"],
              featured: w["work.ui.featured"],
              read: w["work.ui.read"],
              engagement: w["work.ui.engagement"],
              empty: w["work.ui.empty"],
              menuLabel: w["work.ui.menuLabel"],
            }}
          />
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
                {w["work.cta.titleA"]} <span className="accent-word">{w["work.cta.titleB"]}</span>
              </h2>
              <p className="body-copy mx-auto mt-5 font-body text-lead text-ivory/60">
                {w["work.cta.text"]}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href={w["work.cta.primaryHref"]} className="btn btn-primary">
                  {w["work.cta.primary"]}
                </Link>
                <Link href={w["work.cta.secondaryHref"]} className="btn btn-secondary">
                  {w["work.cta.secondary"]}
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