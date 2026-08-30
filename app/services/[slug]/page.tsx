import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ConfidenceIndicator } from "@/components/ui/metrics";
import { PROJECTS, SERVICES } from "@/lib/data";

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.heroCopy,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const related = PROJECTS.filter((project) =>
    project.services.some((s) => service.name.includes(s.split(" ")[0]))
  ).slice(0, 2);
  const serviceIndex = SERVICES.findIndex((s) => s.slug === slug);

  return (
    <>
      <PageHero
        eyebrow={`Service — ${service.name}`}
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

      <section className="relative overflow-hidden pb-20 md:pb-28" aria-label="Problem and solution">
        <div className="section-shell grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="card-surface h-full p-9">
              <h2 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45">
                The problem you are living with
              </h2>
              <p className="body-copy mt-5 font-display text-2xl font-semibold leading-snug text-ivory/85">
                {service.problem}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card-surface h-full border-sienna/25 p-9">
              <h2 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                The position we build for you
              </h2>
              <p className="body-copy mt-5 font-display text-2xl font-semibold leading-snug text-ivory">
                {service.solution}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
        aria-label="What is included"
      >
        <div className="section-shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="What's included"
              title={
                <>
                  Everything you walk away <span className="accent-word">holding.</span>
                </>
              }
              lead="No mystery line items. Every deliverable is named, scoped, and yours at handover."
            />
          </div>
          <div className="lg:col-span-7">
            <ul className="space-y-4">
              {service.deliverables.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 60} className="list-none">
                  <div className="card-surface group flex items-center gap-5 p-6">
                    <span className="font-display text-lg font-semibold text-sienna/40 transition-colors duration-300 group-hover:text-sienna">
                      0{i + 1}
                    </span>
                    <span className="font-display text-lg font-medium text-ivory">{item}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 md:py-28" aria-label={`Our process for ${service.name}`}>
        <div className="section-shell">
          <SectionHeading
            eyebrow="How we run it"
            title={
              <>
                The sequence, <span className="text-ivory/55">step by step.</span>
              </>
            }
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, i) => (
              <Reveal key={step.step} delay={i * 80}>
                <div className="card-surface group h-full p-7">
                  <span className="font-display text-4xl font-semibold text-sienna/20 transition-colors duration-300 group-hover:text-sienna/50">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ivory">
                    {step.step}
                  </h3>
                  <p className="body-copy mt-3 font-body text-sm leading-relaxed text-ivory/60">
                    {step.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section
          className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
          aria-label="Related case studies"
        >
          <div className="section-shell">
            <SectionHeading
              eyebrow="Proof of position"
              title={
                <>
                  This service <span className="accent-word">in the wild.</span>
                </>
              }
            />
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

      <section className="relative overflow-hidden py-20 md:py-28" aria-label="Frequently asked questions">
        <div className="section-shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Questions"
              title={
                <>
                  Asked before <span className="text-ivory/55">every engagement.</span>
                </>
              }
            />
          </div>
          <div className="lg:col-span-8">
            <FaqAccordion faqs={[...service.faqs]} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-olive/15 py-14" aria-label="Next service">
        <div className="section-shell flex flex-wrap items-center justify-between gap-6">
          {(() => {
            const next = SERVICES[(serviceIndex + 1) % SERVICES.length];
            return (
              <>
                <p className="font-body text-sm text-ivory/45">Next service</p>
                <Link
                  href={`/services/${next.slug}`}
                  className="group flex items-center gap-4 text-right"
                >
                  <span className="font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright md:text-3xl">
                    {next.name}
                  </span>
                  <svg viewBox="0 0 20 20" className="h-6 w-6 text-sienna-bright transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </>
            );
          })()}
        </div>
      </section>
    </>
  );
}