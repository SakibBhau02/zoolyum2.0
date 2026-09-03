import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { BlogList } from "@/components/pages/BlogList";
import { Field, FormShell, SubmitButton } from "@/components/pages/Forms";
import { SITE_URL } from "@/lib/data";
import { getPosts } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("blog", {
    title: "Insights - Strategy, Branding & Market Notes from Dhaka",
    description: "Field notes from the market: branding, positioning, growth marketing, design, and Bangladesh market trends - written by the strategists running the engagements, not by a content farm.",
    canonical: "/blog",
    ogTitle: "Zoolyum Insights - Field notes from the market",
    ogDescription: "Strategy, design, and market truth for people who read to lead.",
    card: "summary",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={
          <>
            Field notes from <span className="accent-word">the market.</span>
          </>
        }
        lead="Strategy, design, and market truth - written by the people running the engagements, not by a content farm. For readers who'd rather understand the pattern than chase the tactic."
      />

      <section className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-16" aria-label="Articles">
        <div className="section-shell">
          <BlogList posts={posts} />
        </div>
      </section>

      {/* Newsletter capture - the readers' funnel */}
      <section
        className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-20 md:py-24"
        aria-label="Subscribe to the Zoolyum Letter"
      >
        <div className="dappled dappled--alt" aria-hidden="true" />
        <div className="section-shell relative z-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="thread mx-auto mb-8 block w-16" aria-hidden="true" />
              <h2 className="font-display text-display-2 font-semibold text-ivory">
                One insight a month. <span className="text-ivory/55">No noise.</span>
              </h2>
              <p className="body-copy mx-auto mt-5 font-body text-lead text-ivory/60">
                The same discipline we bring to client work, compressed into an
                email. Reading time: four minutes. Everything else: nothing.
              </p>
              <div className="mx-auto mt-10 max-w-xl" data-lead-inline>
                <FormShell leadKind="newsletter">
                  <Field name="email" label="Email address" type="email" placeholder="you@company.com" required />
                  <SubmitButton label="Get the Letter" />
                </FormShell>
                <p className="mt-4 font-body text-xs text-ivory/35">
                  One email a month. Unsubscribe anytime.
                </p>
              </div>
              <p className="mt-6 font-body text-sm text-ivory/45">
                Prefer the full archive?{" "}
                <Link href="/newsletter" className="font-medium text-sienna-bright underline decoration-sienna/40 underline-offset-4 hover:decoration-sienna-bright">
                  Browse the Zoolyum Letter
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Zoolyum Insights",
            description:
              "Strategy, branding, design, and Bangladesh market trends from a Dhaka strategy studio.",
            url: `${SITE_URL}/blog`,
            publisher: { "@type": "Organization", name: "Zoolyum", url: SITE_URL },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              datePublished: p.date,
              author: { "@type": "Person", name: p.author },
              url: `${SITE_URL}/blog/${p.slug}`,
            })),
          }),
        }}
      />
    </>
  );
}