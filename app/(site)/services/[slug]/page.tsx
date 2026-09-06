import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ConfidenceIndicator } from "@/components/ui/metrics";
import { JourneyRail } from "@/components/pages/JourneyRail";
import { SITE_URL } from "@/lib/data";
import { getServiceSlugs, getService, getServices, getProjects } from "@/lib/content";

export async function generateStaticParams() {
  return (await getServiceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} - ${service.tagline}`,
    description: service.oneParagraph,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} - Zoolyum`,
      description: service.oneParagraph,
      url: `/services/${service.slug}`,
      images: [{ url: `${SITE_URL}/services/${service.slug}/opengraph-image`, width: 1200, height: 630, alt: `${service.name} - Zoolyum` }],
    },
    twitter: {
      card: "summary",
      title: `${service.name} - Zoolyum`,
      description: service.oneParagraph,
      images: [`${SITE_URL}/services/${service.slug}/opengraph-image`],
    },
  };
}

const CHAPTERS = [
  { id: "answer", label: "In one paragraph" },
  { id: "story", label: "The story" },
  { id: "hold", label: "What you hold" },
  { id: "sequence", label: "The sequence" },
  { id: "proof", label: "Proof" },
  { id: "questions", label: "Questions" },
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const allProjects = await getProjects();
  const related = allProjects
    .filter((project) =>
      project.services.some((s) => service.name.includes(s.split(" ")[0])),
    )
    .filter((project) => project.stats.length > 0)
    .slice(0, 2);
  const allServices = await getServices();
  const serviceIndex = allServices.findIndex((s) => s.slug === slug);
  const next = allServices[(serviceIndex + 1) % allServices.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.name,
        description: service.oneParagraph,
        url: `${SITE_URL}/services/${service.slug}`,
        provider: {
          "@type": "Organization",
          name: "Zoolyum",
          url: SITE_URL,
        },
        areaServed: "Bangladesh",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Services", item: `${SITE_URL}/services` },
          { "@type": "ListItem", position: 2, name: service.name, item: `${SITE_URL}/services/${service.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <PageHero
        eyebrow={`Service - ${service.name}`}
        title={service.heroCopy}
        lead={service.tagline}
      >
        <Reveal delay={120}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/contact" className="btn btn-primary">
              Start this engagement
            </Link>
            <Link href="/work" className="btn btn-secondary">
              See it in the wild
            </Link>
          </div>
        </Reveal>
      </PageHero>

      <JourneyRail chapters={CHAPTERS} rail={false} />

      {/* ---- AEO direct-answer block ---- */}
      <section id="answer" aria-label="What is this service" className="relative scroll-mt-32 py-14 md:py-20">
        <div className="section-shell">
          <Reveal>
            <div className="card-surface relative overflow-hidden p-8 md:p-10">
              <span className="thread-y" aria-hidden="true" />
              <p className="eyebrow">In one paragraph</p>
              <p className="body-copy mt-5 max-w-4xl font-display text-xl font-medium leading-relaxed text-ivory/90 md:text-2xl">
                {service.oneParagraph}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- The story: 3 acts ---- */}
      <section
        id="story"
        aria-label={`The story of ${service.name}`}
        className="relative scroll-mt-32 overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
      >
        <div className="dappled dappled--alt" aria-hidden="true" />
        <div className="section-shell relative z-10">
          <Reveal>
            <p className="eyebrow">The story</p>
            <h2 className="mt-4 max-w-3xl font-display text-display-2 font-semibold text-ivory">
              Every engagement starts here -{" "}
              <span className="text-ivory/55">and ends somewhere better.</span>
            </h2>
          </Reveal>

          <div className="mt-14 space-y-5">
            {[
              { act: "Act I", label: "The Situation", body: service.situation, dim: false },
              { act: "Act II", label: "The Noise", body: service.noise, dim: false },
              { act: "Act III", label: "The Position Held", body: service.position, dim: false },
            ].map((a, i) => (
              <Reveal key={a.act} delay={i * 120}>
                <div className="card-surface grid gap-6 p-8 md:grid-cols-12 md:p-10">
                  <div className="md:col-span-4">
                    <p className="font-display text-sm font-semibold tracking-widest text-sienna">
                      {a.act}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-ivory">
                      {a.label}
                    </h3>
                  </div>
                  <p className="body-copy font-body text-lead leading-relaxed text-ivory/70 md:col-span-8">
                    {a.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Story acts (only when the service defines them) ---- */}
      {service.story && service.story.length > 0 && (
        <section aria-label="Story acts" className="relative scroll-mt-32 overflow-hidden border-t border-olive/15 py-20 md:py-24">
          <div className="section-shell">
            <Reveal>
              <p className="eyebrow">The acts</p>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {service.story.map((a, i) => (
                <Reveal key={a.label} delay={i * 100}>
                  <div className="card-surface h-full p-7">
                    <p className="font-display text-sm font-semibold tracking-widest text-sienna">
                      {a.label}
                    </p>
                    <h3 className="mt-3 font-display text-xl font-semibold text-ivory">
                      {a.title}
                    </h3>
                    <p className="body-copy mt-3 font-body text-[15px] leading-relaxed text-ivory/60">
                      {a.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- What you hold: interactive deliverables ---- */}
      <section id="hold" aria-label="What is included" className="relative scroll-mt-32 overflow-hidden py-20 md:py-28">
        <div className="section-shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">What you hold</p>
              <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
                Everything you walk away <span className="accent-word">holding.</span>
              </h2>
              <p className="body-copy mt-5 font-body text-lead text-ivory/60">
                No mystery line items. Every deliverable is named, scoped, and yours at handover.
              </p>
              <div className="mt-8 card-surface-light inline-flex items-baseline gap-x-3 p-5">
                <span className="font-display text-3xl font-semibold text-espresso tabular-nums">
                  {service.proofStat.value}
                </span>
                <span className="font-body text-sm text-espresso/70">{service.proofStat.label}</span>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <ol className="space-y-4">
              {service.deliverables.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 60} className="list-none">
                  <div className="card-surface group flex items-center gap-5 p-6 transition-transform duration-300 hover:translate-x-2">
                    <span className="font-display text-lg font-semibold text-sienna/40 transition-colors duration-300 group-hover:text-sienna">
                      0{i + 1}
                    </span>
                    <span className="font-display text-lg font-medium text-ivory">{item}</span>
                    <svg
                      viewBox="0 0 20 20"
                      className="ml-auto h-4 w-4 shrink-0 text-ivory/25 transition-all duration-300 group-hover:translate-x-1 group-hover:text-sienna-bright"
                      fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"
                    >
                      <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- The sequence: vertical thread ---- */}
      <section
        id="sequence"
        aria-label={`Our process for ${service.name}`}
        className="relative scroll-mt-32 overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
      >
        <div className="section-shell">
          <Reveal>
            <p className="eyebrow">The sequence</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
              The sequence, <span className="text-ivory/55">step by step.</span>
            </h2>
          </Reveal>

          <div className="relative mt-14">
            <ProcessThread />
            <ol className="space-y-6">
              {service.process.map((step, i) => (
                <Reveal as="li" key={step.step} className="list-none">
                  <div className="relative flex gap-6 pl-1 md:pl-2">
                    <span
                      aria-hidden="true"
                      className="relative z-10 mt-1 hidden h-[14px] w-[14px] shrink-0 rounded-full border-2 border-sienna bg-espresso md:block"
                      style={{ marginLeft: "-31px" }}
                    />
                    <div className="card-surface flex-1 p-7">
                      <div className="flex items-baseline gap-4">
                        <span className="font-display text-3xl font-semibold text-sienna/25">
                          0{i + 1}
                        </span>
                        <h3 className="font-display text-xl font-semibold text-ivory">{step.step}</h3>
                      </div>
                      <p className="body-copy mt-3 font-body text-[15px] leading-relaxed text-ivory/60">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- Proof ---- */}
      {related.length > 0 && (
        <section
          id="proof"
          aria-label="Related case studies"
          className="relative scroll-mt-32 overflow-hidden py-20 md:py-28"
        >
          <div className="section-shell">
            <Reveal>
              <p className="eyebrow">Proof of position</p>
              <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
                This service <span className="accent-word">in the wild.</span>
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {related.map((project, i) => (
                <Reveal key={project.slug} delay={i * 100}>
                  <Link href={`/work/${project.slug}`} className="card-surface group block h-full">
                    <div className={`relative h-44 bg-gradient-to-br ${project.gradient}`}>
                      <span aria-hidden="true" className="absolute -bottom-4 left-5 select-none font-display text-8xl font-semibold leading-none tracking-tight text-espresso/20">
                        {project.client.split(" ").map((w) => w[0]).join("")}
                      </span>
                    </div>
                    <div className="p-7">
                      <h3 className="font-display text-xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                        {project.client}
                      </h3>
                      <p className="body-copy mt-2 font-body text-sm leading-relaxed text-ivory/55">
                        {project.title}
                      </p>
                      <div className="mt-5 border-t border-olive/20 pt-5">
                        <ConfidenceIndicator
                          value={project.stats[0].value}
                          label={project.stats[0].label}
                        />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Questions ---- */}
      <section
        id="questions"
        aria-label="Frequently asked questions"
        className="relative scroll-mt-32 overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
      >
        <div className="section-shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow">Questions</p>
              <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
                Asked before <span className="text-ivory/55">every engagement.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <FaqAccordion faqs={[...service.faqs]} />
          </div>
        </div>
      </section>

      {/* ---- Next service ---- */}
      <section className="relative overflow-hidden border-t border-olive/15 py-14" aria-label="Next service">
        <div className="section-shell flex flex-wrap items-center justify-between gap-6">
          <p className="font-body text-sm text-ivory/45">Next service</p>
          <Link href={`/services/${next.slug}`} className="group flex items-center gap-4 text-right">
            <span className="font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright md:text-3xl">
              {next.name}
            </span>
            <svg viewBox="0 0 20 20" className="h-6 w-6 text-sienna-bright transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

/**
 * ProcessThread - the vertical signal line that grows alongside
 * the sequence steps as the section scrolls (CSS-only, scroll-
 * driven via animation-timeline where supported).
 */
function ProcessThread() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[-17px] top-2 bottom-2 hidden w-[2px] bg-olive/25 md:block"
      style={{
        backgroundImage: "linear-gradient(180deg, #ff5001, #ff7a3d)",
        backgroundSize: "100% var(--seq-fill, 0%)",
        backgroundRepeat: "no-repeat",
      }}
      ref={undefined}
      {...({ "data-seq-thread": "true" } as Record<string, string>)}
    />
  );
}