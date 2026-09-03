/**
 * Seed from the current TypeScript content (lib/data.ts +
 * lib/posts-content.ts). Run: bunx --package prisma@7 -- prisma db seed
 * Idempotent: every write is an upsert on the natural key.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  POSTS,
  PROJECTS,
  PROJECT_META,
  POST_FAQS,
  POST_UPDATED,
  SERVICES,
  TEAM,
  JOBS,
  JOB_DETAILS,
  TESTIMONIALS,
  CONTACT,
  CONTACT_FAQS,
  GLOBAL_FAQS,
  CAREERS_FAQS,
  HIRING_STEPS,
  NEWSLETTER_BENEFITS,
} from "../lib/data";
import { ARTICLE_BODIES } from "../lib/posts-content";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  for (const p of POSTS) {
    const body = ARTICLE_BODIES[p.slug] ?? [];
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        date: p.date,
        readTime: p.readTime,
        author: p.author,
        authorRole: p.authorRole,
        cover: p.cover,
        keywords: [...p.keywords],
        takeaways: [...p.takeaways],
        quote: (p as { quote?: string }).quote ?? null,
        images: (p as { images?: unknown }).images ?? [],
        body,
        updated: POST_UPDATED[p.slug] ?? null,
        faqs: POST_FAQS[p.slug] ?? [],
      },
    });
  }

  for (const p of PROJECTS) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        client: p.client,
        industry: p.industry,
        services: [...p.services],
        title: p.title,
        result: p.result,
        timeline: p.timeline,
        images: [...p.images],
        challenge: p.challenge,
        strategy: p.strategy,
        execution: [...p.execution],
        stats: p.stats,
        quote: p.quote ?? null,
        quoteAuthor: p.quoteAuthor ?? null,
        gradient: p.gradient,
        meta: PROJECT_META[p.slug] ?? {},
      },
    });
  }

  for (const s of SERVICES) {
    const svc = s as typeof s & { story?: unknown };
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        name: s.name,
        tagline: s.tagline,
        heroCopy: s.heroCopy,
        oneParagraph: s.oneParagraph,
        situation: s.situation,
        noise: s.noise,
        position: s.position,
        problem: s.problem,
        solution: s.solution,
        proofStat: s.proofStat,
        deliverables: [...s.deliverables],
        process: s.process,
        faqs: s.faqs,
        story: svc.story ?? {},
      },
    });
  }

  for (const [i, m] of TEAM.entries()) {
    await prisma.teamMember.upsert({
      where: { id: i + 1 },
      update: {},
      create: { name: m.name, role: m.role, expertise: m.expertise, initials: m.initials, sort: i },
    });
  }

  for (const j of JOBS) {
    await prisma.job.upsert({
      where: { title: j.title },
      update: {},
      create: {
        title: j.title,
        type: j.type,
        location: j.location,
        dept: j.dept,
        detail: JOB_DETAILS[j.title] ?? {},
      },
    });
  }

  for (const [i, tm] of TESTIMONIALS.entries()) {
    await prisma.testimonial.upsert({
      where: { company: tm.company },
      update: {},
      create: { quote: tm.quote, author: tm.author, company: tm.company, industry: tm.industry, sort: i },
    });
  }

  const SETTINGS: [string, string][] = [
    ["seo.home.title", "Zoolyum - Consultancy. Strategy. Solution."],
    ["seo.home.description", "The strategic partner that turns market noise into a clear competitive advantage. Brand strategy & digital innovation in Dhaka, Bangladesh."],
    ["seo.about.title", "About"],
    ["seo.about.description", "The story of Zoolyum - the strategic partner that turns market noise into clear competitive advantage."],
    ["seo.services.title", "Services - Brand Strategy, Design, Growth, Content & Video"],
    ["seo.services.description", "Five ways Zoolyum strengthens your market position: brand strategy, digital design & UI/UX, growth marketing, content strategy, and video production."],
    ["seo.work.title", "Work - Case Studies with Measured Outcomes"],
    ["seo.work.description", "Case studies as positions held: education, healthcare, fashion retail, SaaS, F&B, hospitality, real estate, and e-commerce brands we have strengthened."],
    ["seo.blog.title", "Insights - Strategy, Branding & Market Notes from Dhaka"],
    ["seo.blog.description", "Field notes from the market: branding, positioning, growth marketing, design, and Bangladesh market trends."],
    ["seo.contact.title", "Start a Conversation"],
    ["seo.contact.description", "Tell us where your brand blends in. One guided conversation, a reply within one working day - Zoolyum, Mirpur 11, Dhaka."],
    ["seo.team.title", "Team"],
    ["seo.team.description", "The people behind the pattern-reading - strategists, designers, engineers, and filmmakers at Zoolyum."],
    ["seo.testimonials.title", "Testimonials"],
    ["seo.testimonials.description", "What clients say - words from education, real estate, e-commerce, and F&B brands."],
    ["seo.careers.title", "Careers"],
    ["seo.careers.description", "Join the team - open roles at Zoolyum, a brand strategy & digital innovation agency in Dhaka."],
    ["seo.faq.title", "FAQ"],
    ["seo.faq.description", "How Zoolyum works - engagements, pricing, industries, timelines, and how we measure success."],
    ["seo.newsletter.title", "The Zoolyum Letter"],
    ["seo.newsletter.description", "One strategic insight a month. No noise. Market patterns, case teardowns, and frameworks from a Dhaka studio."],
    ["seo.process.title", "Our Process"],
    ["seo.process.description", "The Zoolyum method, end to end - Discover, Strategize, Design, Launch, Grow."],
    ["seo.resources.title", "Resources"],
    ["seo.resources.description", "Free tools from the Zoolyum toolkit - brand audit checklist, content calendar template, and campaign brief one-pager."],
    ["seo.privacy-policy.title", "Privacy Policy"],
    ["seo.privacy-policy.description", "How Zoolyum collects, uses, and protects your information."],
    ["seo.terms-of-service.title", "Terms of Service"],
    ["seo.terms-of-service.description", "The terms that govern engagement with Zoolyum and use of this website."],
    ["contact.email", CONTACT.email],
    ["contact.phone", CONTACT.phone],
    ["contact.address", CONTACT.address],
    ["contact.mapUrl", CONTACT.mapUrl],
    ["contact.faqs", JSON.stringify(CONTACT_FAQS)],
    ["faqs.global", JSON.stringify(GLOBAL_FAQS)],
    ["faqs.careers", JSON.stringify(CAREERS_FAQS)],
    ["hiring.steps", JSON.stringify(HIRING_STEPS)],
    ["newsletter.benefits", JSON.stringify(NEWSLETTER_BENEFITS)],
  ];
  for (const [key, value] of SETTINGS) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  const counts = {
    posts: await prisma.post.count(),
    projects: await prisma.project.count(),
    services: await prisma.service.count(),
    team: await prisma.teamMember.count(),
    jobs: await prisma.job.count(),
    testimonials: await prisma.testimonial.count(),
    settings: await prisma.siteSetting.count(),
  };
  console.log("seeded:", JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());