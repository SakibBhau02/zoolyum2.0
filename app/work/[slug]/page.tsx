import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROJECTS } from "@/lib/data";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.client} — Case Study`,
    description: `${project.title}. ${project.result}.`,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  const nextProject = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];

  return (
    <>
      <PageHero
        eyebrow={`Case Study — ${project.industry}`}
        title={project.title}
        lead={project.result}
      >
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {project.services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-sienna/40 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-sienna-bright"
              >
                {service}
              </span>
            ))}
          </div>
        </Reveal>
      </PageHero>

      <section className="relative overflow-hidden pb-20 md:pb-28" aria-label="Challenge and strategy">
        <div className="section-shell grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card-surface h-full p-9">
              <h2 className="eyebrow">The Challenge</h2>
              <p className="body-copy mt-6 font-body text-lead leading-relaxed text-ivory/70">
                {project.challenge}
              </p>
            </div>
          </Reveal>
          <Reveal delay={130}>
            <div className="card-surface h-full border-sienna/25 p-9">
              <h2 className="eyebrow">The Strategy</h2>
              <p className="body-copy mt-6 font-body text-lead leading-relaxed text-ivory/70">
                {project.strategy}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
        aria-label="Execution"
      >
        <div className="section-shell">
          <SectionHeading
            eyebrow="Execution"
            title={
              <>
                How the position <span className="accent-word">was taken.</span>
              </>
            }
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {project.execution.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 70} className="list-none">
                <div className="card-surface group flex items-start gap-5 p-7">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-espresso font-display text-sm font-semibold text-sienna-bright ring-1 ring-sienna/30">
                    {i + 1}
                  </span>
                  <p className="body-copy font-body text-[15px] leading-relaxed text-ivory/70">
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-umber py-20 md:py-28" aria-label="Results">
        <div className="section-shell">
          <p className="eyebrow">Position Held</p>
          <h2 className="mt-4 max-w-2xl font-display text-display-2 font-semibold text-ivory">
            The numbers after the engagement.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {project.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="border-l-2 border-sienna/40 pl-6">
                  <p className="font-display text-5xl font-semibold tracking-tight text-sienna tabular-nums md:text-6xl">
                    {stat.value}
                  </p>
                  <p className="body-copy mt-2 font-body text-sm font-medium text-ivory/60">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          {project.quote && (
            <Reveal delay={200}>
              <figure className="mt-16 max-w-2xl">
                <blockquote>
                  <p className="font-accent text-2xl italic leading-snug text-ivory/90">
                    &ldquo;{project.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-4 font-display text-sm font-semibold text-ivory/70">
                  — {project.quoteAuthor}
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden py-14" aria-label="Next case study">
        <div className="section-shell flex flex-wrap items-center justify-between gap-6">
          <p className="font-body text-sm text-ivory/45">Next position</p>
          <Link
            href={`/work/${nextProject.slug}`}
            className="group flex items-center gap-4 text-right"
          >
            <span className="font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright md:text-3xl">
              {nextProject.client}
            </span>
            <svg viewBox="0 0 20 20" className="h-6 w-6 text-sienna-bright transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}