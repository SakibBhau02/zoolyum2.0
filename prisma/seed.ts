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
  NAV_LINKS,
  TAGLINE,
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

const PROJECT_IMAGE_ALTS: Record<string, string[]> = {
  "apex-academy": ["Apex Academy rebuilt crest and identity", "Admission microsite enquiry flow", "Parent testimonial film still", "Social content engine for admission season", "Identity guidelines"],
  "meridian-health": ["Meridian Health identity system", "Patient report redesign", "Branch signage and wayfinding", "Physician referral portal", "Appointment reminder lifecycle"],
  "loom-lane": ["Loom and Lane premium packaging", "Weaver portrait film series", "Craft traceability storefront page", "Designer collaboration launch", "Packaging detail"],
  "ledgerline": ["LedgerLine interactive product story", "Website hero section", "Onboarding first-value flow", "Demo-led campaign creative", "Messaging architecture"],
  "ember-eats": ["Ember and Eats brand identity", "Launch film still", "Social cutdown frame", "Delivery packaging", "Creator seeding feature"],
  "verandah": ["Verandah Resorts in monsoon season", "Rain-season film still", "Editorial story artwork", "Direct booking experience", "Slow food photography"],
  "urban-prowl": ["Urban Prowl flagship project", "Cinematic listing film still", "Project photography", "Performance campaign creative", "Broker portal dashboard"],
  "canopy-commerce": ["Canopy Commerce storefront redesign", "Homepage user experience", "Two-step checkout flow", "Retention email lifecycle", "Mobile shopping experience"],
};

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
        images: p.images.map((src: string, i: number) => ({ src, alt: ((PROJECT_IMAGE_ALTS as Record<string, string[]>)[p.slug] || [])[i] || (p.client + " case image " + (i + 1)) })),
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
    ["careers.values", JSON.stringify([
      { title: "Ship beats plan", detail: "Ten considered things shipped beats one safe thing planned. The market judges output, so do we." },
      { title: "Merit beats seniority", detail: "The best argument wins the room - interns have improved founder ideas here, on record." },
      { title: "Read before you move", detail: "Diagnosis before prescription, in client work and in hiring. Opinions arrive with evidence." },
      { title: "Blunt is kind", detail: "Direct feedback early beats polite silence that wastes months. We critique work, never people." },
    ])],
    ["careers.benefits", JSON.stringify([
      { title: "Work that ships", detail: "Nothing here dies in a deck. Everything you make faces the market." },
      { title: "Results bonus", detail: "Quarterly bonus tied to client outcomes - when the work lands, you land." },
      { title: "Learning budget", detail: "Courses, conferences, and books on us. Sharp minds stay sharp." },
      { title: "No ego policy", detail: "Ideas win on merit, not seniority. Interns have improved founder ideas here." },
      { title: "Flexible studio", detail: "Hybrid work, flexible hours. We measure output, not chair time." },
      { title: "Health cover", detail: "Full health insurance for you and your family. Peace of mind is a benefit." },
    ])],
    ["faqs.newsletter", JSON.stringify([
      { q: "How often will you email me?", a: "Once a month. The Letter ships on a monthly rhythm - one issue, four minutes of reading, and silence in between." },
      { q: "Is the Letter free?", a: "Yes, completely. Every issue - patterns, teardowns, and frameworks - costs nothing and asks for nothing in return." },
      { q: "Will you spam me or share my email?", a: "Never. One email a month, no promotions for hire, no list sharing. Your address stays between you and us." },
      { q: "How do I unsubscribe?", a: "One click, from any issue, forever. No retention maze, no exit survey guilt - leaving is as easy as joining." },
    ])],
    ["social.linkedin", "https://linkedin.com"],
    ["social.facebook", "https://facebook.com"],
    ["social.instagram", "https://instagram.com"],
    ["social.youtube", "https://youtube.com"],
    ["brand.tagline", TAGLINE],
    ["header.cta.label", "Start a Conversation"],
    ["contact.hero.lead", "One conversation. Thirty minutes. A clear read on where your brand blends in - and what it takes to stand apart. We reply within one working day."],
  ];
  const AFTER_SEND_SEED = [
    { title: "We reply within one working day", body: "A strategist - not a bot, not a form letter - reads your note and writes back." },
    { title: "A 30-minute discovery call", body: "We ask sharp questions and map where you stand. No pitch deck, no obligation." },
    { title: "A tailored proposal", body: "Scope, timeline, and investment in plain language - usually within days." },
  ];
  await prisma.siteSetting.upsert({ where: { key: "contact.after_send" }, update: {}, create: { key: "contact.after_send", value: JSON.stringify(AFTER_SEND_SEED) } });
  const linkCount = await prisma.menuLink.count();
  if (linkCount === 0) {
    const headerLinks = NAV_LINKS.map((l, i) => ({ label: l.label, href: l.href, group: "header", sort: i, visible: true }));
    const exploreLinks = [...NAV_LINKS.map((l) => ({ label: l.label, href: l.href })), { label: "Careers", href: "/careers" }, { label: "Resources", href: "/resources" }, { label: "Our Process", href: "/process" }, { label: "FAQ", href: "/faq" }, { label: "Newsletter", href: "/newsletter" }].map((l, i) => ({ ...l, group: "explore", sort: i, visible: true }));
    const legalLinks = [{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms of Service", href: "/terms-of-service" }].map((l, i) => ({ ...l, group: "legal", sort: i, visible: true }));
    await prisma.menuLink.createMany({ data: [...headerLinks, ...exploreLinks, ...legalLinks] });
  }
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