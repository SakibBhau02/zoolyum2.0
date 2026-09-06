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
import { getProjects, getTestimonials, getHomeCopy, getHomeStages, getHomeStats, getNewsCopy, getHomeLockup } from "@/lib/content";
import type { HeroCopy } from "@/components/home/Chapter1Noise";
import type { TaglineCopy } from "@/components/home/Chapter2Terrain";
import type { MethodCopy } from "@/components/home/Chapter3Method";
import type { ResultsCopy } from "@/components/home/Chapter4Results";
import type { WorkCopy } from "@/components/home/Chapter5Work";
import type { VoicesCopy } from "@/components/home/Chapter6Voices";

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
  const [projects, testimonials, home, stages, stats, news, lockup] = await Promise.all([getProjects(), getTestimonials(), getHomeCopy(), getHomeStages(), getHomeStats(), getNewsCopy(), getHomeLockup()]);
  const hero: HeroCopy = {
    eyebrow: home["home.hero.eyebrow"] ?? "",
    titleA: home["home.hero.titleA"] ?? "",
    titleAccent: home["home.hero.titleAccent"] ?? "",
    titleB: home["home.hero.titleB"] ?? "",
    sub: home["home.hero.sub"] ?? "",
    ctaPrimary: home["home.hero.ctaPrimary"] ?? "",
    ctaSecondary: home["home.hero.ctaSecondary"] ?? "",
    ctaPrimaryHref: home["home.hero.ctaPrimaryHref"] ?? "/contact",
    ctaSecondaryHref: home["home.hero.ctaSecondaryHref"] ?? "/work",
    hint: home["home.hero.hint"] ?? "",
    meter: home["home.hero.meter"] ?? "",
    beatB: home["home.hero.beatB"] ?? "",
    beatC: home["home.hero.beatC"] ?? "",
    beatD: home["home.hero.beatD"] ?? "",
  };
  const tagline: TaglineCopy = {
    eyebrow: home["home.tagline.eyebrow"] ?? "", openerA: home["home.tagline.openerA"] ?? "", openerB: home["home.tagline.openerB"] ?? "", openerSub: home["home.tagline.openerSub"] ?? "",
    act1step: home["home.tagline.act1.step"] ?? "", act1title: home["home.tagline.act1.title"] ?? "", act1sub: home["home.tagline.act1.sub"] ?? "", act1body: home["home.tagline.act1.body"] ?? "",
    act2step: home["home.tagline.act2.step"] ?? "", act2title: home["home.tagline.act2.title"] ?? "", act2sub: home["home.tagline.act2.sub"] ?? "", act2body: home["home.tagline.act2.body"] ?? "",
    act3step: home["home.tagline.act3.step"] ?? "", act3title: home["home.tagline.act3.title"] ?? "", act3sub: home["home.tagline.act3.sub"] ?? "", act3body: home["home.tagline.act3.body"] ?? "",
    lockupEyebrow: home["home.tagline.lockupEyebrow"] ?? "", lockup,
    lockupNote: home["home.tagline.lockupNote"] ?? "", cta: home["home.tagline.cta"] ?? "", ctaHref: home["home.tagline.ctaHref"] ?? "/services",
  };
  const method: MethodCopy = {
    eyebrow: home["home.method.eyebrow"] ?? "", title: home["home.method.title"] ?? "",
    lead: home["home.method.lead"] ?? "", hint: home["home.method.hint"] ?? "",
    stages: stages.map((s: { num: string; title: string; detail: string; outputs: string[] }) => ({ ...s })),
  };
  const results: ResultsCopy = {
    eyebrow: home["home.results.eyebrow"] ?? "", title: home["home.results.title"] ?? "",
    lead: home["home.results.lead"] ?? "", closing: home["home.results.closing"] ?? "",
    stats: stats.map((s: { value: number; suffix: string; label: string }) => ({ ...s })),
  };
  const work: WorkCopy = {
    eyebrow: home["home.work.eyebrow"] ?? "", title: home["home.work.title"] ?? "",
    lead: home["home.work.lead"] ?? "", cta: home["home.work.cta"] ?? "",
    href: home["home.work.href"] ?? "/work",
    nextTitle: home["home.work.nextTitle"] ?? "", nextText: home["home.work.nextText"] ?? "",
    nextCta: home["home.work.nextCta"] ?? "", nextHref: home["home.work.nextHref"] ?? "/contact",
  };
  const voices: VoicesCopy = {
    eyebrow: home["home.voices.eyebrow"] ?? "", title: home["home.voices.title"] ?? "",
    newsEyebrow: home["home.voices.newsEyebrow"] ?? "", newsTitle: home["home.voices.newsTitle"] ?? "", newsLead: home["home.voices.newsLead"] ?? "",
    news,
  };
  return (
    <>
      <Chapter1Noise copy={hero} />
      <SkipPrompt />
      <Chapter2Terrain copy={tagline} />
      <Chapter3Method copy={method} />
      <Chapter4Results copy={results} />
      <Chapter5Work projects={projects} copy={work} />
      <IndustryTicker />
      <Chapter6Voices testimonials={testimonials} copy={voices} news={news} />
      <Chapter7CTA />
    </>
  );
}