import { Chapter1Noise } from "@/components/home/Chapter1Noise";
import { Chapter2Terrain } from "@/components/home/Chapter2Terrain";
import { Chapter3Method } from "@/components/home/Chapter3Method";
import { Chapter4Results } from "@/components/home/Chapter4Results";
import { Chapter5Work } from "@/components/home/Chapter5Work";
import { Chapter6Voices } from "@/components/home/Chapter6Voices";
import { IndustryTicker } from "@/components/home/IndustryTicker";
import { Chapter7CTA } from "@/components/home/Chapter7CTA";
import type { Metadata } from "next";
import { SkipPrompt } from "@/components/leadgen/SkipPrompt";

export const metadata: Metadata = {
  title: "Zoolyum - Consultancy. Strategy. Solution.",
  description:
    "Brand strategy, digital design, and growth marketing from Dhaka, Bangladesh. Consultancy that reads the market, strategy that claims defensible ground, solutions built as one system.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Zoolyum - Consultancy. Strategy. Solution.",
    description:
      "Every market has a pattern. Most brands react to it. We help you read it first - and act while others are still guessing.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zoolyum - Consultancy. Strategy. Solution.",
    description:
      "Brand strategy, digital design, and growth marketing from Dhaka, Bangladesh.",
  },
};

export default function Home() {
  return (
    <>
      <Chapter1Noise />
      <SkipPrompt />
      <Chapter2Terrain />
      <Chapter3Method />
      <Chapter4Results />
      <Chapter5Work />
      <IndustryTicker />
      <Chapter6Voices />
      <Chapter7CTA />
    </>
  );
}
