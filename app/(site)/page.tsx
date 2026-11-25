import { Hero } from "@/components/home/Hero";
import { Chapter1Brief } from "@/components/home/Chapter1Brief";
import { Chapter2FieldNotes } from "@/components/home/Chapter2FieldNotes";
import { Chapter3Method } from "@/components/home/Chapter3Method";
import { Chapter4Results } from "@/components/home/Chapter4Results";
import { Chapter5Work } from "@/components/home/Chapter5Work";
import { Chapter6Voices } from "@/components/home/Chapter6Voices";
import { IndustryTicker } from "@/components/home/IndustryTicker";
import { Chapter7CTA } from "@/components/home/Chapter7CTA";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import { SkipPrompt } from "@/components/leadgen/SkipPrompt";
import {
  getProjects,
  getTestimonials,
  getHomeCopy,
  getHomeStages,
  getHomeStats,
  getNewsCopy,
  getHomeFilms,
  getSocials,
  getBriefScenario,
} from "@/lib/content";
import type { HeroCopy } from "@/components/home/Hero";
import type { BriefCopy } from "@/components/home/Chapter1Brief";
import type { FieldNotesCopy, FieldNoteAct } from "@/components/home/Chapter2FieldNotes";
import type { MethodCopy } from "@/components/home/Chapter3Method";
import type { ResultsCopy } from "@/components/home/Chapter4Results";
import type { WorkCopy } from "@/components/home/Chapter5Work";
import type { VoicesCopy } from "@/components/home/Chapter6Voices";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("home", {
    title: "Consultancy. Strategy. Solution.",
    description: "Brand strategy, digital design, and growth marketing from Dhaka, Bangladesh. Consultancy that reads the market, strategy that claims defensible ground, solutions built as one system.",
    canonical: "/",
    ogTitle: "Zoolyum - Consultancy. Strategy. Solution.",
    ogDescription: "Every market has a pattern. Most brands react to it. We help you read it first - and act while others are still guessing.",
    card: "summary_large_image",
  });
}

export default async function Home() {
  const [projects, testimonials, home, stages, stats, news, films, socials, brief] = await Promise.all([
    getProjects(),
    getTestimonials(),
    getHomeCopy(),
    getHomeStages(),
    getHomeStats(),
    getNewsCopy(),
    getHomeFilms(),
    getSocials(),
    getBriefScenario(),
  ]);

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
  };

  const briefCopy: BriefCopy = {
    eyebrow: home["home.brief.eyebrow"] ?? "",
    title: home["home.brief.title"] ?? "",
    lead: home["home.brief.lead"] ?? "",
    meta: home["home.brief.meta"] ?? "",
    callLabel: home["home.brief.callLabel"] ?? "",
    yourCall: home["home.brief.yourCall"] ?? "",
    whatWeDid: home["home.brief.whatWeDid"] ?? "",
    whyNot: home["home.brief.whyNot"] ?? "",
    next: home["home.brief.next"] ?? "",
    finish: home["home.brief.finish"] ?? "",
    previous: home["home.brief.previous"] ?? "",
    seeAll: home["home.brief.seeAll"] ?? "",
    idleTitle: home["home.brief.idleTitle"] ?? "",
    idleBody: home["home.brief.idleBody"] ?? "",
    summaryEyebrow: home["home.brief.summaryEyebrow"] ?? "",
    stamp: home["home.brief.stamp"] ?? "",
    caseCta: home["home.brief.caseCta"] ?? "",
    workCta: home["home.brief.workCta"] ?? "",
    workHref: home["home.brief.workHref"] ?? "/work",
    replay: home["home.brief.replay"] ?? "",
    reviewing: home["home.brief.reviewing"] ?? "",
    backToCurrent: home["home.brief.backToCurrent"] ?? "",
    stageNote: home["home.brief.stageNote"] ?? "",
  };

  const briefProject = projects.find((project) => project.slug === brief.projectSlug);

  const notesActs: FieldNoteAct[] = [1, 2, 3].map((n) => ({
    kicker: home[`home.notes.act${n}.kicker`] ?? "",
    word: home[`home.notes.act${n}.word`] ?? "",
    lead: home[`home.notes.act${n}.lead`] ?? "",
    body: home[`home.notes.act${n}.body`] ?? "",
    caseSlug: home[`home.notes.act${n}.case`] ?? "",
    proof: home[`home.notes.act${n}.proof`] ?? "",
    proofLabel: home[`home.notes.act${n}.proofLabel`] ?? "",
    deliverables: (home[`home.notes.act${n}.deliverables`] ?? "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean),
    linkLabel: home[`home.notes.act${n}.linkLabel`] ?? "",
  }));

  const notes: FieldNotesCopy = {
    eyebrow: home["home.notes.eyebrow"] ?? "",
    openerA: home["home.notes.openerA"] ?? "",
    openerB: home["home.notes.openerB"] ?? "",
    openerLead: home["home.notes.openerLead"] ?? "",
    meta: home["home.notes.meta"] ?? "",
    indexLabel: home["home.notes.indexLabel"] ?? "",
    indexNote: home["home.notes.indexNote"] ?? "",
    outcomeLabel: home["home.notes.outcomeLabel"] ?? "",
    acts: notesActs,
    closeEyebrow: home["home.notes.closeEyebrow"] ?? "",
    closeLine: home["home.notes.closeLine"] ?? "",
    closeNote: home["home.notes.closeNote"] ?? "",
    cta: home["home.notes.cta"] ?? "",
    ctaHref: home["home.notes.ctaHref"] ?? "/work",
    cta2: home["home.notes.cta2"] ?? "",
    cta2Href: home["home.notes.cta2Href"] ?? "/services",
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

  const rawChannel = (home["home.work.channelHref"] || socials.youtube || "").trim();
  const withProtocol = rawChannel && !/^https?:\/\//i.test(rawChannel) ? `https://${rawChannel}` : rawChannel;
  const channelHref = /^https?:\/\/(www\.)?youtube\.com\/?$/i.test(withProtocol) ? "" : withProtocol;

  const work: WorkCopy = {
    eyebrow: home["home.work.eyebrow"] ?? "",
    title: home["home.work.title"] ?? "",
    lead: home["home.work.lead"] ?? "",
    cta: home["home.work.cta"] ?? "",
    href: home["home.work.href"] ?? "/work",
    reelEyebrow: home["home.work.reelEyebrow"] ?? "",
    reelNote: home["home.work.reelNote"] ?? "",
    nowPlaying: home["home.work.nowPlaying"] ?? "",
    channelCta: home["home.work.channelCta"] ?? "",
    channelHref,
    casesEyebrow: home["home.work.casesEyebrow"] ?? "",
    casesNote: home["home.work.casesNote"] ?? "",
    casesCta: home["home.work.casesCta"] ?? "",
    nextTitle: home["home.work.nextTitle"] ?? "",
    nextText: home["home.work.nextText"] ?? "",
    nextCta: home["home.work.nextCta"] ?? "",
    nextHref: home["home.work.nextHref"] ?? "/contact",
  };

  const voices: VoicesCopy = {
    eyebrow: home["home.voices.eyebrow"] ?? "",
    title: home["home.voices.title"] ?? "",
    newsEyebrow: home["home.voices.newsEyebrow"] ?? "",
    newsTitle: home["home.voices.newsTitle"] ?? "",
    newsLead: home["home.voices.newsLead"] ?? "",
    news,
  };

  return (
    <>
      <Hero copy={hero} />
      <Chapter1Brief scenario={brief} project={briefProject} copy={briefCopy} />
      <SkipPrompt />
      <Chapter2FieldNotes copy={notes} projects={projects} />
      <Chapter5Work projects={projects} films={films} copy={work} />
      <Chapter3Method copy={method} />
      <Chapter4Results copy={results} />
      <IndustryTicker />
      <Chapter6Voices testimonials={testimonials} copy={voices} news={news} />
      <Chapter7CTA />
    </>
  );
}
