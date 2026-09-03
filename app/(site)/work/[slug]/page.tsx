import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { JourneyRail } from "@/components/pages/JourneyRail";
import { CaseStat } from "@/components/pages/CaseStat";
import { CaseGallery } from "@/components/pages/CaseGallery";
import { SITE_URL } from "@/lib/data";
import { getProjectSlugs, getProject, getProjects, getServices } from "@/lib/content";

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  const url = `${SITE_URL}/work/${project.slug}`;
  return {
    title: `${project.client}: ${project.result}`,
    description: `${project.title}. ${project.challenge} Outcome: ${project.result}.`,
    keywords: [project.industry, "case study", ...project.services],
    alternates: { canonical: url },
    openGraph: {
      title: `${project.client} - ${project.result} | Zoolyum`,
      description: `${project.title}. Outcome: ${project.result}.`,
      url,
      siteName: "Zoolyum",
      type: "article",
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: `${project.client} - ${project.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.client} - ${project.result}`,
      description: project.title,
      images: [`${url}/opengraph-image`],
    },
  };
}

const CHAPTERS = [
  { id: "snapshot", label: "Snapshot" },
  { id: "problem", label: "The problem" },
  { id: "solution", label: "The solution" },
  { id: "overcome", label: "How we overcame" },
  { id: "toolbox", label: "Toolbox" },
  { id: "frames", label: "The frames" },
  { id: "results", label: "Results" },
  { id: "faq", label: "FAQ" },
  { id: "next-steps", label: "Next steps" },
];

function groupToolbox(toolbox: string[]): { group: string; items: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const t of toolbox) {
    const i = t.indexOf(":");
    const g = i > 0 ? t.slice(0, i).trim() : "Stack";
    const item = i > 0 ? t.slice(i + 1).trim() : t;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(item);
  }
  return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const meta = project.meta;

  const all = await getProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  const nextProject = all[(idx + 1) % all.length];

  // The service most likely to convert this reader
  const services = await getServices();
  const primaryService = services.find((s) =>
    project.services.some((ps) => s.name.split(" ")[0] === ps.split(" ")[0]),
  );

  const wordCount = [project.challenge, project.strategy, meta?.overview ?? "", ...project.execution].join(" ").split(/\s+/).filter(Boolean).length;
  const faqs = meta?.faqs ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${project.client} - ${project.title}`,
        description: meta?.overview ?? project.challenge,
        about: `${project.industry} - ${project.services.join(", ")}`,
        dateModified: "2026-09-03",
        wordCount,
        url: `${SITE_URL}/work/${project.slug}`,
        image: `${SITE_URL}${project.images[0]?.src ?? ""}`,
        author: { "@type": "Organization", name: "Zoolyum", url: SITE_URL },
        publisher: { "@type": "Organization", name: "Zoolyum", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Work", item: `${SITE_URL}/work` },
          { "@type": "ListItem", position: 2, name: project.client, item: `${SITE_URL}/work/${project.slug}` },
        ],
      },
      ...(faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <PageHero
        eyebrow={`Case Study - ${project.industry}`}
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
            <span className="rounded-full border border-olive/35 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-ivory/60">
              {project.timeline}
            </span>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-olive/15 pt-7" aria-label="Headline outcomes">
            {project.stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <dt className="order-2 mt-1.5 block font-body text-[11px] uppercase tracking-[0.16em] text-ivory/40">
                  {s.label}
                </dt>
                <dd className="order-1 font-display text-2xl font-semibold text-sienna-bright tabular-nums md:text-4xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </PageHero>

      <JourneyRail chapters={CHAPTERS} rail={false} />

      {/* ---- Snapshot: the at-a-glance panel (AEO answer block) ---- */}
      <section id="snapshot" aria-label="Case snapshot" className="relative scroll-mt-32 py-14 md:py-20">
        <div className="section-shell">
          <Reveal>
            <div className="card-surface relative overflow-hidden p-8 md:p-10">
              <span className="thread absolute left-0 top-0 h-full w-[3px]" aria-hidden="true" />
              <p className="eyebrow">The case at a glance</p>
              {meta && (
                <p className="body-copy mt-5 max-w-3xl font-body text-[1.0625rem] leading-[1.8] text-ivory/75">
                  {meta.overview}
                </p>
              )}
              <div className="mt-7 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { k: "Client", v: project.client },
                  { k: "Industry", v: project.industry },
                  { k: "Timeline", v: project.timeline },
                  { k: "Disciplines", v: project.services.join(" + ") },
                ].map((row) => (
                  <div key={row.k}>
                    <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/40">
                      {row.k}
                    </p>
                    <p className="mt-2 font-display text-lg font-medium text-ivory">{row.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- The Problem: heavy, editorial ---- */}
      <section
        id="problem"
        aria-label="The problem"
        className="relative scroll-mt-32 overflow-hidden py-20 md:py-28"
      >
        <div className="section-shell">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow">The problem</p>
              <h2 className="mt-5 font-display text-display-2 font-semibold leading-tight text-ivory">
                {project.challenge}
              </h2>
              <p className="mt-6 font-body text-sm tracking-wide text-ivory/40">
                Every engagement opens here - the ground, read honestly.
              </p>
            </div>
          </Reveal>
          {meta && meta.obstacles.length > 0 && (
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {meta.obstacles.map((o, i) => (
                <Reveal key={o.title} delay={i * 90}>
                  <div className="card-surface h-full p-6">
                    <p className="font-display text-sm font-semibold text-sienna tabular-nums" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ivory">
                      {o.title}
                    </h3>
                    <p className="mt-2.5 font-body text-sm leading-relaxed text-ivory/55">
                      {o.how}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---- The Solution: the reading of the terrain ---- */}
      <section
        id="solution"
        aria-label="The solution"
        className="relative scroll-mt-32 overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
      >
        <div className="dappled dappled--alt" aria-hidden="true" />
        <div className="section-shell relative z-10">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="eyebrow">The solution</p>
                <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
                  What we did <span className="text-ivory/55">about it.</span>
                </h2>
              </div>
              <p className="body-copy font-body text-lead leading-relaxed text-ivory/80 lg:col-span-8">
                {project.strategy}
              </p>
            </div>
          </Reveal>
          {meta && meta.deliverables.length > 0 && (
            <Reveal delay={100}>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Deliverables">
                {meta.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 rounded-xl border border-olive/25 bg-espresso/60 p-4 font-body text-sm leading-relaxed text-ivory/75">
                    <svg viewBox="0 0 16 16" className="mt-1 h-3.5 w-3.5 shrink-0 text-sienna" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      {/* ---- How we overcame: numbered moves on a thread ---- */}
      <section
        id="overcome"
        aria-label="How we overcame"
        className="relative scroll-mt-32 overflow-hidden py-20 md:py-28"
      >
        <div className="section-shell">
          <Reveal>
            <p className="eyebrow">How we overcame</p>
            <h2 className="mt-4 font-display text-display-2 font-semibold text-ivory">
              How the position <span className="accent-word">was taken.</span>
            </h2>
          </Reveal>

          <div className="relative mt-14">
            <span
              aria-hidden="true"
              className="absolute left-[-17px] top-2 bottom-2 hidden w-[2px] md:block"
              style={{ backgroundImage: "linear-gradient(180deg, #ff5001, #ff7a3d)" }}
            />
            <ol className="space-y-6">
              {project.execution.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 70} className="list-none">
                  <div className="relative flex gap-6 pl-1 md:pl-2">
                    <span
                      aria-hidden="true"
                      className="relative z-10 mt-6 hidden h-[14px] w-[14px] shrink-0 rounded-full border-2 border-sienna bg-espresso md:block"
                      style={{ marginLeft: "-31px" }}
                    />
                    <div className="card-surface group flex-1 items-start p-7">
                      <div className="flex items-start gap-5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-espresso font-display text-sm font-semibold text-sienna-bright ring-1 ring-sienna/30 transition-colors duration-300 group-hover:bg-sienna group-hover:text-espresso">
                          {i + 1}
                        </span>
                        <p className="body-copy font-body text-[15px] leading-relaxed text-ivory/75">
                          {item}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- Toolbox: what it was built with ---- */}
      {meta && meta.toolbox.length > 0 && (
        <section
          id="toolbox"
          aria-label="Toolbox"
          className="relative scroll-mt-32 overflow-hidden border-t border-olive/15 py-20 md:py-24"
        >
          <div className="section-shell">
            <Reveal>
              <p className="eyebrow">Toolbox</p>
              <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
                What it was built <span className="text-ivory/55">with.</span>
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {groupToolbox(meta.toolbox).map((g, gi) => (
                <Reveal key={g.group} delay={gi * 80}>
                  <div className="h-full rounded-xl border border-olive/25 bg-umber/40 p-6">
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">
                      {g.group}
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {g.items.map((item) => (
                        <li key={item} className="font-body text-sm text-ivory/70">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CaseGallery images={project.images} client={project.client} />
      {/* ---- Results: the proof ---- */}
      <section
        id="results"
        aria-label="Results"
        className="relative scroll-mt-32 overflow-hidden bg-umber py-20 md:py-28"
      >
        <div className="section-shell">
          <Reveal>
            <p className="eyebrow">Position held</p>
            <h2 className="mt-4 max-w-2xl font-display text-display-2 font-semibold text-ivory">
              The numbers after <span className="accent-word">the engagement.</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {project.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="border-l-2 border-sienna/40 pl-6">
                  <CaseStat value={stat.value} label={stat.label} index={i} />
                </div>
              </Reveal>
            ))}
          </div>

          {project.quote && (
            <Reveal delay={200}>
              <figure className="mt-16 max-w-2xl">
                <blockquote>
                  <p className="font-accent text-2xl italic leading-snug text-ivory/90 md:text-3xl">
                    &ldquo;{project.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-4 font-display text-sm font-semibold text-ivory/70">
                  - {project.quoteAuthor}
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </section>

      {/* ---- FAQ: objection handling (mirrored as FAQPage JSON-LD) ---- */}
      {faqs.length > 0 && (
        <section
          id="faq"
          aria-label="Case questions"
          className="relative scroll-mt-32 overflow-hidden py-20 md:py-24"
        >
          <div className="section-shell">
            <div className="max-w-3xl">
              <Reveal>
                <p className="eyebrow">Questions, answered</p>
                <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
                  What prospects <span className="text-ivory/55">ask us.</span>
                </h2>
              </Reveal>
              <div className="mt-8 space-y-3">
                {faqs.map((f) => (
                  <Reveal key={f.q} delay={30}>
                    <details className="faq-item group rounded-xl border border-olive/25 bg-umber/40 transition-colors duration-200 open:border-sienna/40 open:bg-umber/70">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-[1.05rem] font-semibold leading-snug text-ivory [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-olive/35 text-sienna-bright transition-transform duration-300 group-open:rotate-45">
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                          </svg>
                        </span>
                      </summary>
                      <p className="body-copy px-5 pb-5 font-body text-[15px] leading-relaxed text-ivory/65">
                        {f.a}
                      </p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- Next Steps: the conversion zone ---- */}
      <section
        id="next-steps"
        aria-label="Start a similar engagement"
        className="relative scroll-mt-32 overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
      >
        <div className="dappled" aria-hidden="true" />
        <div className="section-shell relative z-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="thread mx-auto mb-8 block w-16" aria-hidden="true" />
              <h2 className="font-display text-display-2 font-semibold text-ivory">
                Facing a similar <span className="accent-word">problem?</span>
              </h2>
              <p className="body-copy mx-auto mt-5 font-body text-lead text-ivory/60">
                {project.client} started with one conversation about where their
                market was heading. If your category has the same pattern, the
                same method applies - the terrain is read before we move.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/contact" className="btn btn-primary">
                  Start a Conversation
                </Link>
                {primaryService && (
                  <Link href={`/services/${primaryService.slug}`} className="btn btn-secondary">
                    Explore {primaryService.name}
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Next case study: keep the loop ---- */}
      <section className="relative overflow-hidden py-14" aria-label="Next case study">
        <div className="section-shell">
          <p className="font-body text-sm text-ivory/45">Next position</p>
          <Link href={`/work/${nextProject.slug}`} className="group mt-4 block">
            <div className="card-surface flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-center gap-6">
                <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${nextProject.gradient}`}>
                  <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-semibold text-espresso/70">
                    {nextProject.client.split(" ").map((w) => w[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-widest text-ivory/45">
                    {nextProject.industry}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {nextProject.client}
                  </h3>
                  <p className="body-copy mt-1 font-body text-sm text-ivory/55">
                    {nextProject.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {nextProject.stats[0] && (
                  <div className="text-right">
                    <p className="font-display text-3xl font-semibold text-sienna tabular-nums">
                      {nextProject.stats[0].value}
                    </p>
                    <p className="font-body text-xs text-ivory/45">
                      {nextProject.stats[0].label.toLowerCase()}
                    </p>
                  </div>
                )}
                <svg viewBox="0 0 20 20" className="h-6 w-6 shrink-0 text-sienna-bright transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ---- Sticky mobile conversion bar ---- */}
      <div className="case-cta-bar fixed inset-x-0 bottom-0 z-40 border-t border-olive/25 bg-espresso/90 px-4 backdrop-blur-md lg:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))", paddingTop: "0.75rem" }}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold text-ivory">{project.result}</p>
            <p className="font-body text-[11px] text-ivory/45">Want this for your brand?</p>
          </div>
          <Link href="/contact" className="btn btn-primary shrink-0 !px-5 !py-2.5 !text-[13px]">
            Start a Conversation
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}