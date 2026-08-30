import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { GLOBAL_FAQS } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "How Zoolyum works — engagements, pricing, industries, timelines, and how we measure success.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Frequently Asked Questions"
        title={
          <>
            The practical <span className="accent-word">answers.</span>
          </>
        }
        lead="How we work, what things cost, and what happens after you get in touch — stated plainly, because that's the whole brand."
      />

      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="FAQ content">
        <div className="section-shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <h2 className="font-display text-display-3 font-semibold text-ivory">
                  Still deciding?
                </h2>
                <p className="body-copy mt-4 font-body text-[15px] leading-relaxed text-ivory/60">
                  The fastest way to answer a question we haven&apos;t listed
                  is a thirty-minute conversation. No pitch deck — just your
                  market, mapped.
                </p>
                <Link href="/contact" className="btn btn-primary mt-7">
                  Start a Conversation
                </Link>
              </Reveal>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Reveal delay={100}>
              <FaqAccordion faqs={[...GLOBAL_FAQS]} />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
