import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { TestimonialWall } from "@/components/pages/TestimonialWall";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "What clients say — words from education, real estate, e-commerce, and F&B brands we've worked with.",
};

export default function TestimonialsPage() {
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
          <TestimonialWall />
        </div>
      </section>
    </>
  );
}
