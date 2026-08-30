import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/pages/PageHero";
import { ReadingProgress } from "@/components/pages/ReadingProgress";
import { Reveal } from "@/components/ui/Reveal";
import { POSTS } from "@/lib/data";
import { ARTICLE_BODIES } from "@/lib/posts-content";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const body = ARTICLE_BODIES[post.slug] ?? [];
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <ReadingProgress />
      <PageHero
        eyebrow={`Insights — ${post.category}`}
        title={post.title}
        lead={`${new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} · ${post.readTime} read`}
      />

      <article className="relative overflow-hidden pb-20 md:pb-28">
        <div className="section-shell max-w-3xl">
          <Reveal>
            <p className="body-copy font-body text-lead font-medium leading-relaxed text-ivory/75">
              {post.excerpt}
            </p>
          </Reveal>

          <div className="mt-10 space-y-8">
            {body.map((paragraph, i) => (
              <Reveal key={i} delay={30}>
                <p className="body-copy font-body text-[1.0625rem] leading-[1.85] text-ivory/65">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="card-surface mt-14 p-9">
              <p className="eyebrow">Your next move</p>
              <p className="mt-4 font-display text-2xl font-semibold leading-snug text-ivory">
                Reading about positioning is step one. Holding it is step two.
              </p>
              <Link href="/contact" className="btn btn-primary mt-7">
                Start a Conversation
              </Link>
            </div>
          </Reveal>
        </div>
      </article>

      <section
        className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-16 md:py-20"
        aria-label="Related articles"
      >
        <div className="section-shell">
          <h2 className="font-display text-2xl font-semibold text-ivory">
            Keep reading
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="card-surface group flex h-full flex-col p-8"
              >
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                  {rel.category}
                </p>
                <h3 className="mt-4 flex-1 font-display text-xl font-semibold leading-snug text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                  {rel.title}
                </h3>
                <p className="mt-6 font-body text-xs tracking-wide text-ivory/40">
                  {rel.readTime} read
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}