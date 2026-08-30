import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Field, FormShell, SubmitButton } from "@/components/pages/Forms";
import { NEWSLETTER_BENEFITS, POSTS } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Zoolyum Letter",
  description:
    "One strategic insight a month. No noise. Market patterns, case teardowns, and frameworks from a Dhaka strategy studio.",
};

export default function NewsletterPage() {
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

      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Subscribe">
        <div className="section-shell grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div data-lead-inline className="card-surface p-8 md:p-10">
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
                <SubmitButton label="Subscribe" />
              </FormShell>
            </div>
          </Reveal>

          <Reveal delay={130} className="lg:col-span-5">
            <div className="flex h-full flex-col gap-4">
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

      <section
        className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-20 md:py-24"
        aria-label="Recent insights"
      >
        <div className="section-shell">
          <Reveal>
            <p className="eyebrow">The kind of thing you&apos;ll get</p>
            <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
              From the archive
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {POSTS.slice(0, 3).map((post, i) => (
              <Reveal key={post.slug} delay={i * 80}>
                <div className="card-surface flex h-full flex-col p-7">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                    {post.category}
                  </p>
                  <h3 className="mt-3 flex-1 font-display text-lg font-semibold leading-snug text-ivory">
                    {post.title}
                  </h3>
                  <p className="mt-5 font-body text-xs tracking-wide text-ivory/40">
                    {post.readTime} read
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
