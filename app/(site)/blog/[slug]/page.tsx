import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/pages/ReadingProgress";
import { Reveal } from "@/components/ui/Reveal";
import { JourneyRail } from "@/components/pages/JourneyRail";
import { BlogFigure } from "@/components/pages/BlogFigure";
import { ShareButtons } from "@/components/pages/ShareButtons";
import { SITE_URL } from "@/lib/data";
import { getPostSlugs, getPost, getPosts, getPostBody, getPostExtras } from "@/lib/content";

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  const { updated: modUpdated } = await getPostExtras(slug);
  const modified = modUpdated ?? post.date;
  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...post.keywords],
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "Zoolyum",
      type: "article",
      publishedTime: post.date,
      modifiedTime: modified,
      authors: [post.author],
      section: post.category,
      tags: [...post.keywords],
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${url}/opengraph-image`],
    },
  };
}

function formatLong(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const body = await getPostBody(post.slug);
  const { faqs, updated: exUpdated, sections } = await getPostExtras(post.slug);
  const updated = exUpdated ?? post.date;
  const revised = updated !== post.date;
  const wordCount = body.join(" ").split(/\s+/).filter(Boolean).length;

  const all = await getPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  const related = [
    ...all.filter((p) => p.slug !== post.slug && p.category === post.category),
    ...all.filter((p) => p.slug !== post.slug && p.category !== post.category),
  ].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: updated,
        wordCount,
        author: { "@type": "Person", name: post.author, jobTitle: post.authorRole, url: `${SITE_URL}/team` },
        publisher: {
          "@type": "Organization",
          name: "Zoolyum",
          url: SITE_URL,
          logo: `${SITE_URL}/logo.svg`,
        },
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        image: `${SITE_URL}${post.cover}`,
        articleSection: post.category,
        keywords: post.keywords.join(", "),
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Insights", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 2, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
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

  const chapters = [
    { id: "takeaways", label: "In this article" },
    ...sections
      .map((s, si) => ({ si, label: s.heading }))
      .filter((s) => s.label !== "")
      .map((s) => ({ id: `section-${s.si}`, label: s.label })),
    ...(faqs.length > 0 ? [{ id: "faq", label: "Questions, answered" }] : []),
  ];

  return (
    <>
      <ReadingProgress />

      {/* ---------- Editorial hero ---------- */}
      <header className="relative overflow-hidden pt-32 md:pt-40">
        <div className="grain" aria-hidden="true" />
        <div className="section-shell relative">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 font-body text-xs tracking-wide text-ivory/40">
              <li><Link href="/" className="transition-colors hover:text-sienna-bright">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/blog" className="transition-colors hover:text-sienna-bright">Insights</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-ivory/60">{post.category}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <Reveal>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-xs tracking-wide text-ivory/45">
                <Link
                  href="/blog"
                  className="rounded-full border border-sienna-bright/60 bg-sienna/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sienna-bright transition-colors duration-200 hover:bg-sienna-bright hover:text-espresso"
                >
                  {post.category}
                </Link>
                <span>{formatLong(post.date)}</span>
                {revised && <span>Updated {formatLong(updated)}</span>}
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-olive/60" />
                <span>{post.readTime} read</span>
              </div>
              <h1 className="mt-6 font-display text-display-1 font-semibold leading-[1.04] tracking-tight text-ivory">
                {post.title}
              </h1>
              <p className="body-copy mt-6 font-body text-lead leading-relaxed text-ivory/65 md:text-[1.25rem] md:leading-[1.7]">
                {post.excerpt}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-y border-olive/15 py-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sienna/15 font-display text-sm font-semibold text-sienna-bright" aria-hidden="true">
                    {post.author.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <div>
                    <p className="font-body text-sm font-medium text-ivory/85"><Link href="/team" className="transition-colors hover:text-sienna-bright">{post.author}</Link></p>
                    <p className="font-body text-xs text-ivory/40">{post.authorRole}, Zoolyum</p>
                  </div>
                </div>
                <ShareButtons title={post.title} />
              </div>
            </Reveal>
          </div>

          <Reveal delay={180}>
            <figure className="mt-10">
              <div className="overflow-hidden rounded-2xl border border-olive/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]">
                <Image
                  src={post.cover}
                  alt={post.title}
                  width={1600}
                  height={900}
                  unoptimized
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
            </figure>
          </Reveal>
        </div>
      </header>

      <JourneyRail chapters={chapters} rail={false} />

      {/* ---------- Article body ---------- */}
      <article className="relative pb-20 pt-14 md:pb-24 md:pt-20">
        <div className="section-shell flex flex-col gap-14 lg:flex-row lg:gap-14 xl:gap-16">
          <div className="min-w-0 flex-1">
            {/* AEO: the takeaway box */}
            <section id="takeaways" aria-label="Key takeaways" className="scroll-mt-32" data-sidebar-anchor>
              <Reveal>
                <div className="card-surface relative overflow-hidden p-7 md:p-8">
                  <span className="thread-y" aria-hidden="true" />
                  <p className="eyebrow">In this article</p>
                  <ul className="mt-5 space-y-3.5">
                    {post.takeaways.map((t) => (
                      <li key={t} className="flex items-start gap-3.5 font-body text-[15px] leading-relaxed text-ivory/75">
                        <svg viewBox="0 0 16 16" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-sienna" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                          <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </section>

            <div className="mt-14 space-y-14 md:mt-16 md:space-y-16">
              {sections.map((section, si) => {
                const paras = body.slice(section.paras[0], section.paras[1] + 1).filter((p) => !p.startsWith("## "));
                const n = sections.slice(0, si + 1).filter((s) => s.heading !== "").length;
                return (
                  <section key={`section-${si}`} id={`section-${si}`} className="scroll-mt-32" aria-label={section.heading !== "" ? section.heading : "Article section " + (si + 1)}>
                    {section.heading !== "" && (
                    <Reveal>
                      <h2 className="flex items-baseline gap-4 font-display text-2xl font-semibold tracking-tight text-ivory md:text-3xl">
                        <span className="font-display text-sm font-semibold text-sienna tabular-nums" aria-hidden="true">
                          {String(n).padStart(2, "0")}
                        </span>
                        {section.heading}
                      </h2>
                    </Reveal>
                    )}
                    <div className="mt-6 space-y-6">
                      {paras.map((paragraph, pi) => (
                        <Reveal key={pi} delay={30}>
                          <p className={`body-copy font-body text-[1.0625rem] leading-[1.85] text-ivory/65${si === 0 && pi === 0 ? " dropcap" : ""}`}>
                            {paragraph}
                          </p>
                        </Reveal>
                      ))}
                    </div>

                    {post.images?.[si] && (
                      <BlogFigure
                        src={post.images[si].src}
                        caption={post.images[si].caption}
                        priority={si === 0}
                      />
                    )}

                    {si === 1 && post.quote && (
                      <Reveal delay={60}>
                        <blockquote className="my-10 border-l-2 border-sienna pl-6 md:pl-8">
                          <p className="font-accent text-2xl italic leading-snug text-ivory/90 md:text-3xl">
                            &ldquo;{post.quote}&rdquo;
                          </p>
                        </blockquote>
                      </Reveal>
                    )}
                  </section>
                );
              })}
            </div>

            {/* AEO: visible FAQ (mirrored as FAQPage JSON-LD) */}
            {faqs.length > 0 && (
              <section id="faq" aria-label="Frequently asked questions" className="mt-14 scroll-mt-32 md:mt-16">
                <Reveal>
                  <p className="eyebrow">Questions, answered</p>
                  <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ivory md:text-3xl">
                    The short version<span className="text-sienna">.</span>
                  </h2>
                </Reveal>
                <div className="mt-7 space-y-3">
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
              </section>
            )}

            {/* Author spotlight */}
            <Reveal>
              <div className="card-surface mt-14 flex flex-col gap-5 p-7 sm:flex-row sm:items-center md:p-8">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sienna/15 font-display text-lg font-semibold text-sienna-bright" aria-hidden="true">
                  {post.author.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <p className="eyebrow">Written by</p>
                  <p className="mt-2 font-display text-xl font-semibold text-ivory"><Link href="/team" className="transition-colors hover:text-sienna-bright">{post.author}</Link></p>
                  <p className="body-copy mt-1 font-body text-sm leading-relaxed text-ivory/50">
                    {post.authorRole} at Zoolyum - running the engagements these
                    insights come from.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Conversion */}
            <Reveal>
              <div className="card-surface mt-8 p-8 md:p-9">
                <p className="eyebrow">Your next move</p>
                <p className="mt-4 font-display text-2xl font-semibold leading-snug text-ivory">
                  Reading about positioning is step one. Holding it is step two.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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

          {/* Sticky aside */}
          <aside className="lg:w-[19rem] xl:w-[20rem]" aria-label="Article notes">
            <div className="space-y-6 lg:sticky lg:top-28">
              {post.quote && (
                <div className="relative overflow-hidden rounded-xl border border-olive/25 bg-umber/60 p-7">
                  <span className="thread-y" aria-hidden="true" />
                  <p className="font-accent text-[1.45rem] italic leading-snug text-ivory/90">
                    &ldquo;{post.quote}&rdquo;
                  </p>
                  <p className="mt-4 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
                    The signal of this piece
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-olive/25 bg-umber/40 p-6">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-olive-hi">
                  Filed under
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/blog"
                    className="rounded-full border border-sienna-bright/60 bg-sienna/10 px-3 py-1.5 font-body text-xs font-medium text-sienna-bright transition-colors duration-200 hover:bg-sienna-bright hover:text-espresso"
                  >
                    {post.category}
                  </Link>
                  {post.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full border border-olive/35 px-3 py-1.5 font-body text-xs text-ivory/55"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-sienna/25 bg-gradient-to-b from-umber/80 to-umber/40 p-6">
                <p className="font-display text-lg font-semibold leading-snug text-ivory">
                  Facing this problem?
                </p>
                <p className="mt-2 font-body text-[13px] leading-relaxed text-ivory/55">
                  One conversation maps where your brand stands.
                </p>
                <Link
                  href="/contact"
                  className="btn btn-secondary mt-5 w-full !text-[13px]"
                >
                  Start a Conversation
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* Prev / Next */}
      <nav className="relative overflow-hidden border-t border-olive/15 py-12" aria-label="More articles">
        <div className="section-shell grid gap-6 md:grid-cols-2">
          <Link href={`/blog/${prev.slug}`} className="card-surface group flex items-center gap-5 p-6">
            <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-sienna-bright transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M16 10H4m0 0 5-5m-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="min-w-0">
              <p className="font-body text-[11px] uppercase tracking-widest text-ivory/40">Previous</p>
              <p className="mt-1 truncate font-display text-lg font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                {prev.title}
              </p>
            </div>
          </Link>
          <Link href={`/blog/${next.slug}`} className="card-surface group flex items-center justify-end gap-5 p-6 text-right">
            <div className="min-w-0">
              <p className="font-body text-[11px] uppercase tracking-widest text-ivory/40">Next</p>
              <p className="mt-1 truncate font-display text-lg font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                {next.title}
              </p>
            </div>
            <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-sienna-bright transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Related */}
      <section
        className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-16 md:py-20"
        aria-label="Related articles"
      >
        <div className="section-shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-ivory md:text-3xl">
              Keep reading<span className="text-sienna">.</span>
            </h2>
            <Link href="/blog" className="font-body text-sm font-medium text-sienna-bright underline decoration-sienna/40 underline-offset-4 hover:decoration-sienna-bright">
              All insights
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="card-surface group flex h-full flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={rel.cover}
                    alt={rel.title}
                    width={1600}
                    height={900}
                    unoptimized
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-read group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                    {rel.category}
                  </p>
                  <h3 className="mt-3 line-clamp-2 flex-1 font-display text-lg font-semibold leading-snug text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {rel.title}
                  </h3>
                  <p className="mt-4 font-body text-xs text-ivory/40">
                    {rel.author} - {rel.readTime} read
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}