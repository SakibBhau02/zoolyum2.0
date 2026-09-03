import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Field, FormShell, SubmitButton } from "@/components/pages/Forms";
import { NEWSLETTER_BENEFITS, POSTS } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Zoolyum Letter",
  description:
    "One strategic insight a month. No noise. Market patterns, case teardowns, and frameworks from a Dhaka strategy studio.",
  alternates: { canonical: "/newsletter" },
  openGraph: {
    title: "The Zoolyum Letter | Zoolyum",
    description: "One strategic insight a month. No noise. Market patterns, case teardowns, and frameworks from a Dhaka strategy studio.",
    url: "/newsletter",
  },
  twitter: {
    card: "summary",
    title: "The Zoolyum Letter | Zoolyum",
    description: "One strategic insight a month. No noise. Market patterns, case teardowns, and frameworks from a Dhaka strategy studio.",
  },
};

const LETTER_FAQS = [
  {
    q: "How often will you email me?",
    a: "Once a month. The Letter ships on a monthly rhythm - one issue, four minutes of reading, and silence in between.",
  },
  {
    q: "Is the Letter free?",
    a: "Yes, completely. Every issue - patterns, teardowns, and frameworks - costs nothing and asks for nothing in return.",
  },
  {
    q: "Will you spam me or share my email?",
    a: "Never. One email a month, no promotions for hire, no list sharing. Your address stays between you and us.",
  },
  {
    q: "How do I unsubscribe?",
    a: "One click, from any issue, forever. No retention maze, no exit survey guilt - leaving is as easy as joining.",
  },
] as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NewsletterPage() {
  const archive = POSTS.slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="The Zoolyum Letter"
        title={
          <>
            One strategic insight a month.{" "}
            <span className="text-ivory/55">No noise.</span>
          </>
        }
        lead="The same discipline we bring to client work, compressed into an email. Reading time: four minutes. Everything else: nothing."
      />

      {/* ---------- Subscribe ---------- */}
      <section id="subscribe" className="relative scroll-mt-28 overflow-hidden pb-24 pt-12 md:pb-32 md:pt-16" aria-label="Subscribe">
        <div className="section-shell grid items-start gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div data-lead-inline className="card-surface relative overflow-hidden p-8 md:p-10">
              <span className="thread absolute left-0 top-0 h-full w-[3px]" aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold text-ivory">
                Join the list
              </h2>
              <p className="body-copy mt-2 font-body text-sm text-ivory/50">
                One email a month. Unsubscribe in one click, forever.
              </p>
              <FormShell className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="First name" name="firstname" required />
                  <Field label="Work email" name="email" type="email" required />
                </div>
                <SubmitButton label="Get the Letter" />
              </FormShell>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-olive/20 pt-5" aria-label="Our promise">
                {["One email a month", "No spam, ever", "Unsubscribe anytime"].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-body text-xs text-ivory/45">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-sienna" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={130} className="lg:col-span-5">
            <div className="flex h-full flex-col gap-4">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/40">
                Every issue carries
              </p>
              {NEWSLETTER_BENEFITS.map((benefit, i) => (
                <div key={benefit.title} className="card-surface group flex items-start gap-5 p-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-espresso font-display text-sm font-semibold text-sienna-bright ring-1 ring-sienna/30">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ivory">
                      {benefit.title}
                    </h3>
                    <p className="body-copy mt-1.5 font-body text-sm leading-relaxed text-ivory/55">
                      {benefit.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Inside each issue: the sample preview ---------- */}
      <section
        className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-20 md:py-24"
        aria-label="Inside each issue"
      >
        <div className="section-shell grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Try before you trust</p>
            <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
              This is what lands in your inbox<span className="text-sienna">.</span>
            </h2>
            <p className="body-copy mt-5 font-body text-[15px] leading-relaxed text-ivory/60">
              No teasers, no threadbois, no &ldquo;link in bio&rdquo;. Each
              issue is one pattern, one teardown, one framework - written to be
              finished with your morning tea.
            </p>
          </Reveal>
          <Reveal delay={140} className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-olive/25 bg-espresso shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]" aria-label="Sample issue preview">
              <div className="flex items-center gap-3 border-b border-olive/20 px-6 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sienna/15 font-display text-xs font-semibold text-sienna-bright" aria-hidden="true">
                  ZL
                </span>
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-medium text-ivory/85">
                    The Zoolyum Letter #12 - Why discount brands disappear
                  </p>
                  <p className="font-body text-xs text-ivory/40">From: Zoolyum · Monthly · 4 min read</p>
                </div>
              </div>
              <ol className="space-y-1 p-3 md:p-4">
                {[
                  { n: "01", t: "The Pattern", d: "What consolidated in Dhaka retail this month, and why it matters for your category." },
                  { n: "02", t: "The Teardown", d: "One campaign decoded - the strategy, the numbers, what we would do differently." },
                  { n: "03", t: "The Framework", d: "A one-page checklist you can run on your own brand this afternoon." },
                ].map((row) => (
                  <li key={row.n} className="flex items-start gap-4 rounded-xl p-4 transition-colors duration-200 hover:bg-umber/60">
                    <span className="font-display text-sm font-semibold text-sienna tabular-nums" aria-hidden="true">{row.n}</span>
                    <div>
                      <p className="font-display text-base font-semibold text-ivory">{row.t}</p>
                      <p className="body-copy mt-1 font-body text-sm leading-relaxed text-ivory/55">{row.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- From the archive ---------- */}
      <section
        className="relative overflow-hidden py-20 md:py-24"
        aria-label="Recent insights"
      >
        <div className="section-shell">
          <Reveal>
            <p className="eyebrow">The kind of thing you&apos;ll get</p>
            <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
              From the archive<span className="text-sienna">.</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {archive.map((post, i) => (
              <Reveal key={post.slug} delay={i * 80} className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="card-surface group flex h-full flex-col p-7"
                  aria-label={`Read: ${post.title}`}
                >
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                    {post.category}
                  </p>
                  <h3 className="mt-3 line-clamp-3 flex-1 font-display text-lg font-semibold leading-snug text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {post.title}
                  </h3>
                  <p className="body-copy mt-3 line-clamp-2 font-body text-[13px] leading-relaxed text-ivory/50">
                    {post.excerpt}
                  </p>
                  <p className="mt-5 flex items-center justify-between border-t border-olive/20 pt-4 font-body text-xs text-ivory/40">
                    <span>{formatDate(post.date)} - {post.readTime} read</span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4 text-sienna-bright transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Author voice ---------- */}
      <section className="relative overflow-hidden border-t border-olive/15 py-16 md:py-20" aria-label="About the author">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sienna/15 font-display text-lg font-semibold text-sienna-bright" aria-hidden="true">
                SC
              </span>
              <p className="mt-5 font-accent text-2xl italic leading-snug text-ivory/85">
                &ldquo;I write what I would send a founder friend - no fluff, no funnelspeak.&rdquo;
              </p>
              <p className="mt-4 font-body text-sm text-ivory/50">
                <span className="font-medium text-ivory/80">Sakib Chowdhury</span> - Founder &amp; Creative Director, Zoolyum
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-20 md:py-24" aria-label="Newsletter questions">
        <div className="section-shell">
          <div className="max-w-3xl">
            <Reveal>
              <p className="eyebrow">Before you join</p>
              <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
                Fair questions<span className="text-sienna">.</span>
              </h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {LETTER_FAQS.map((f) => (
                <Reveal key={f.q} delay={30}>
                  <details className="faq-item group rounded-xl border border-olive/25 bg-espresso/60 transition-colors duration-200 open:border-sienna/40 open:bg-espresso">
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

      {/* ---------- Closing CTA ---------- */}
      <section className="relative overflow-hidden py-20 md:py-24" aria-label="Get the Letter">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="thread mx-auto mb-8 block w-16" aria-hidden="true" />
              <h2 className="font-display text-display-2 font-semibold text-ivory">
                Get the next issue<span className="text-sienna">.</span>
              </h2>
              <p className="body-copy mx-auto mt-5 font-body text-lead text-ivory/60">
                Four minutes a month. The pattern, the teardown, the framework -
                before your competitors read it.
              </p>
              <div className="mt-9">
                <Link href="#subscribe" className="btn btn-primary">
                  Get the Letter
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
            "@type": "FAQPage",
            mainEntity: LETTER_FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </>
  );
}