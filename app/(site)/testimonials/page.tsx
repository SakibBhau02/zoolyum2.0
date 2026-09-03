import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import { SITE_URL } from "@/lib/data";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { TestimonialWall } from "@/components/pages/TestimonialWall";
import { getTestimonials } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("testimonials", {
    title: "Testimonials",
    description: "What clients say — words from education, real estate, e-commerce, and F&B brands we've worked with.",
    canonical: "/testimonials",
    ogTitle: "Testimonials | Zoolyum",
    ogDescription: "What clients say - words from education, real estate, e-commerce, and F&B brands we have worked with.",
    card: "summary",
  });
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHero
        eyebrow="What Clients Say"
        title={
          <>
            Judged by the ground <span className="accent-word">our clients hold.</span>
          </>
        }
        lead="We don't write our own references. The brands we've strengthened do that for us."
      />
      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Testimonials">
        <div className="section-shell">
          <TestimonialWall testimonials={testimonials} />
        </div>
      </section>
      <section className="relative overflow-hidden border-t border-olive/15 py-16 md:py-20" aria-label="See the proof">
        <div className="section-shell flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-display text-xl font-semibold text-ivory md:text-2xl">Words are nice. Numbers are better<span className="text-sienna">.</span></p>
            <p className="body-copy mt-2 font-body text-sm text-ivory/55">Every claim above has a case study with measured outcomes behind it.</p>
          </div>
          <Link href="/work" className="btn btn-primary shrink-0">See the work</Link>
        </div>
      </section>

    </>
  );
}
