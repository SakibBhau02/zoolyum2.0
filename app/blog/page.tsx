import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { POSTS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Field notes from the market — branding, marketing, design, and Bangladesh market trends from the Zoolyum strategists.",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Field notes from <span className="accent-word">the market.</span>
          </>
        }
        lead="Strategy, design, and market truth — written by the people running the engagements, not by a content farm."
      />

      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Articles">
        <div className="section-shell">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="card-surface group grid overflow-hidden lg:grid-cols-2"
            >
              <div className="relative min-h-[280px] bg-gradient-to-br from-espresso via-umber to-sienna/50">
                <span aria-hidden="true" className="absolute left-6 top-6 rounded-full bg-sienna-bright px-4 py-1.5 font-display text-[11px] font-semibold uppercase tracking-widest text-espresso">
                  Featured
                </span>
                <span aria-hidden="true" className="absolute -bottom-6 right-6 select-none font-display text-[10rem] font-semibold leading-none tracking-tight text-sienna/10 transition-transform duration-500 group-hover:scale-105">
                  Z
                </span>
              </div>
              <div className="p-9 md:p-12">
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                  {featured.category}
                </p>
                <h2 className="mt-4 font-display text-display-3 font-semibold leading-tight text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                  {featured.title}
                </h2>
                <p className="body-copy mt-5 font-body text-[15px] leading-relaxed text-ivory/55">
                  {featured.excerpt}
                </p>
                <p className="mt-8 font-body text-xs tracking-wide text-ivory/40">
                  {formatDate(featured.date)} · {featured.readTime} read
                </p>
              </div>
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 80}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="card-surface group flex h-full flex-col p-8"
                >
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                    {post.category}
                  </p>
                  <h3 className="mt-4 flex-1 font-display text-xl font-semibold leading-snug text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {post.title}
                  </h3>
                  <p className="body-copy mt-4 font-body text-sm leading-relaxed text-ivory/50">
                    {post.excerpt}
                  </p>
                  <p className="mt-6 border-t border-olive/20 pt-5 font-body text-xs tracking-wide text-ivory/40">
                    {formatDate(post.date)} · {post.readTime} read
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
