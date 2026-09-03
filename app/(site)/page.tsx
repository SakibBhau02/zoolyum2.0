import { Chapter1Noise } from "@/components/home/Chapter1Noise";
import { Chapter2Terrain } from "@/components/home/Chapter2Terrain";
import { Chapter3Method } from "@/components/home/Chapter3Method";
import { Chapter4Results } from "@/components/home/Chapter4Results";
import { Chapter5Work } from "@/components/home/Chapter5Work";
import { Chapter6Voices } from "@/components/home/Chapter6Voices";
import { IndustryTicker } from "@/components/home/IndustryTicker";
import { Chapter7CTA } from "@/components/home/Chapter7CTA";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import { SkipPrompt } from "@/components/leadgen/SkipPrompt";
import { getProjects, getTestimonials } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("home", {
    title: "Zoolyum - Consultancy. Strategy. Solution.",
    description: "Brand strategy, digital design, and growth marketing from Dhaka, Bangladesh. Consultancy that reads the market, strategy that claims defensible ground, solutions built as one system.",
    canonical: "/",
    ogTitle: "Zoolyum - Consultancy. Strategy. Solution.",
    ogDescription: "Every market has a pattern. Most brands react to it. We help you read it first - and act while others are still guessing.",
    card: "summary_large_image",
  });
}

export default async function Home() {
  const [projects, testimonials] = await Promise.all([getProjects(), getTestimonials()]);
  return (
    <>
      <Chapter1Noise />
      <SkipPrompt />
      <Chapter2Terrain />
      <Chapter3Method />
      <Chapter4Results />
      <Chapter5Work projects={projects} />
      <IndustryTicker />
      <Chapter6Voices testimonials={testimonials} />
      <Chapter7CTA />
    </>
  );
}
