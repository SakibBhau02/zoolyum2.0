import { Chapter1Noise } from "@/components/home/Chapter1Noise";
import { Chapter2Terrain } from "@/components/home/Chapter2Terrain";
import { Chapter3Method } from "@/components/home/Chapter3Method";
import { Chapter4Results } from "@/components/home/Chapter4Results";
import { Chapter5Work } from "@/components/home/Chapter5Work";
import { Chapter6Voices } from "@/components/home/Chapter6Voices";
import { IndustryTicker } from "@/components/home/IndustryTicker";
import { Chapter7CTA } from "@/components/home/Chapter7CTA";
import { SkipPrompt } from "@/components/leadgen/SkipPrompt";

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
