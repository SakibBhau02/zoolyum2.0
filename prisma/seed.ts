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
  PROCESS_STAGES,
  STATS,
  INDUSTRIES_TICKER,
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
    ["seo.google_verification", ""],
    ["seo.pinterest_verification", ""],
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

const HOME_COPY: Record<string, string> = {
"home.hero.eyebrow": "Consultancy. Strategy. Solution.",
"home.hero.titleA": "Every market looks",
"home.hero.titleAccent": "crowded",
"home.hero.titleB": "from the outside.",
"home.hero.sub": "Every market has a pattern. Most brands react to it. We help you read it first - and act while others are still guessing.",
"home.hero.ctaPrimary": "Start a Conversation",
"home.hero.ctaSecondary": "See Our Work",
"home.hero.ctaPrimaryHref": "/contact",
"home.hero.ctaSecondaryHref": "/work",
"home.hero.hint": "THE NOISE BEGINS BELOW",
"home.hero.meter": "MARKET NOISE",
"home.hero.beatB": "Most brands respond to that by shouting|louder.",
"home.hero.beatC": "In the fog, most brands start to|look the same.",
"home.hero.beatD": "In that noise, only one|line|ever cuts through.",
"home.tagline.eyebrow": "Chapter 02 — The Tagline",
"home.tagline.openerA": "Three words.",
"home.tagline.openerB": "The entire method.",
"home.tagline.openerSub": "Not a slogan - a sequence. Every engagement runs through all three, in order.",
"home.tagline.act1.step": "01 · The Read",
"home.tagline.act1.title": "Consultancy.",
"home.tagline.act1.sub": "The diagnosis comes before the prescription.",
"home.tagline.act1.body": "We start as the outside eye. Before any deliverable exists, we read your market, competitors, and buyers - until the pattern under the noise is plain. The first deliverable is the advice itself: a read you could act on without us.",
"home.tagline.act2.step": "02 · The Map",
"home.tagline.act2.title": "Strategy.",
"home.tagline.act2.sub": "A position you can defend - chosen, not wished for.",
"home.tagline.act2.body": "Reading is not enough. Strategy is choosing the one piece of ground your brand can hold and no competitor can copy - then aiming every touchpoint at it. The crowd clusters where it is loud. We position where it is defensible.",
"home.tagline.act3.step": "03 · The Build",
"home.tagline.act3.title": "Solution.",
"home.tagline.act3.sub": "Execution that carries the thinking - all the way out.",
"home.tagline.act3.body": "Identity, interface, and campaign, built as one system - so the strategy survives contact with the market. This is where the reading and the choosing become something your customers can see, feel, and act on.",
"home.tagline.lockupEyebrow": "The sequence, locked",
"home.tagline.lockupNote": "One thread runs through all three - the sequence every Zoolyum engagement is built on.",
"home.tagline.cta": "See the disciplines behind each word",
"home.tagline.ctaHref": "/services",
"home.method.eyebrow": "The Method",
"home.method.title": "Five stages. |One line of thinking.",
"home.method.lead": "The same disciplined sequence on every engagement - because method is what turns projects into positions.",
"home.method.hint": "KEEP SCROLLING",
"home.results.eyebrow": "The Results",
"home.results.title": "Proof, stated |plainly.",
"home.results.lead": "Numbers from engagements we are allowed to name. Precise on purpose - vague claims are just noise.",
"home.results.closing": "Eight years in the Bangladesh market. One hundred twenty engagements across education, real estate, F&B, and e-commerce. The pattern holds: give a brand a defensible position, and the category takes notice.",
"home.work.eyebrow": "Selected Work",
"home.work.title": "Ground our clients |hold.",
"home.work.lead": "Every engagement is judged the same way: did the position strengthen - and can we prove it.",
"home.work.cta": "View all work",
"home.work.href": "/work",
"home.work.nextTitle": "Your position could be next.",
"home.work.nextText": "Every case study here started with one conversation about where the market was heading.",
"home.work.nextCta": "Start a Conversation",
"home.work.nextHref": "/contact",
"home.voices.eyebrow": "What Clients Say",
"home.voices.title": "In their |words.",
"home.voices.newsEyebrow": "One insight a month",
"home.voices.newsTitle": "One strategic insight a month. |No noise.",
"home.voices.newsLead": "The same discipline we bring to client work, in an email. Reading time: four minutes. Everything else: nothing.",
"home.news.placeholder": "Your email",
"home.news.button": "Subscribe",
"home.news.disclaimer": "No spam, no sharing, unsubscribe anytime.",
"home.news.label": "Email address",
"home.news.success": "You're on the list. First insight arrives next month.",
"home.cta.eyebrow": "Let us Read Your Market Together",
"home.cta.title": "Somewhere in your market, there is a pattern only a strategist would notice. |Let us find it.",
"home.cta.lead": "One conversation. Thirty minutes. We will show you where your brand blends in - and what it takes to stand apart.",
"home.cta.primary": "Start a Conversation",
"home.cta.secondary": "Explore Our Services",
"home.cta.primaryHref": "/contact",
"home.cta.secondaryHref": "/services",
"home.skip.text": "Hooked already?",
"home.skip.cta": "See how we help brands cut through — skip to our work",
"home.skip.href": "/work",
"home.footer.blurb": "The strategic partner that turns market noise into a clear competitive advantage.",
"home.footer.newsTitle": "One insight a month",
"home.footer.newsText": "One strategic insight a month. No noise — we dislike noise more than you do.",
"home.footer.based": "— Based in Dhaka.",
  "analytics.ga4_id": "",
  "analytics.clarity_id": "",
  "analytics.pixel_id": "",
  "analytics.gtm_id": "",
  "analytics.meta_capi_token": "",
  "analytics.meta_test_event_code": "",
  "analytics.ga4_api_secret": "",
  "analytics.server_tracking_enabled": "true",
};

const WORK_COPY: Record<string, string> = {
"work.page.eyebrow": "Selected Work",
"work.page.titleA": "Ground our clients",
"work.page.titleB": "hold.",
"work.page.lead": "Every engagement is judged the same way: did the position strengthen, and can we prove it. Filter by industry or service - the numbers are precise on purpose.",
"work.ui.filter": "Filter",
"work.ui.all": "All work",
"work.ui.industry": "Industry",
"work.ui.service": "Service",
"work.ui.showingA": "Showing",
"work.ui.showingB": "of",
"work.ui.showingC": "case studies",
"work.ui.featured": "Featured case",
"work.ui.read": "Read case study",
"work.ui.engagement": "engagement",
"work.ui.empty": "No work in this filter yet. Ask us about yours.",
"work.ui.menuLabel": "Filter work by industry or service",
"work.cta.titleA": "Your position could be",
"work.cta.titleB": "next.",
"work.cta.text": "Every case study above started the same way - one conversation about where the market was heading. Bring us your terrain; we'll tell you honestly if there's a position worth taking.",
"work.cta.primary": "Start a Conversation",
"work.cta.primaryHref": "/contact",
"work.cta.secondary": "Explore the services",
"work.cta.secondaryHref": "/services",
"work.case.eyebrowPrefix": "Case Study - ",
"work.case.snapshotEyebrow": "The case at a glance",
"work.case.rowClient": "Client",
"work.case.rowIndustry": "Industry",
"work.case.rowTimeline": "Timeline",
"work.case.rowDisciplines": "Disciplines",
"work.case.problemEyebrow": "The problem",
"work.case.problemNote": "Every engagement opens here - the ground, read honestly.",
"work.case.solutionEyebrow": "The solution",
"work.case.solutionTitleA": "What we did",
"work.case.solutionTitleB": "about it.",
"work.case.overcomeEyebrow": "How we overcame",
"work.case.overcomeTitleA": "How the position",
"work.case.overcomeTitleB": "was taken.",
"work.case.toolboxEyebrow": "Toolbox",
"work.case.toolboxTitleA": "What it was built",
"work.case.toolboxTitleB": "with.",
"work.case.toolboxUngrouped": "Stack",
"work.case.framesEyebrow": "The frames",
"work.case.framesTitleA": "The work,",
"work.case.framesTitleB": "in frames.",
"work.case.framesNote": "Hover to lean in. Click any frame to view it full-size.",
"work.case.resultsEyebrow": "Position held",
"work.case.resultsTitleA": "The numbers after",
"work.case.resultsTitleB": "the engagement.",
"work.case.faqEyebrow": "Questions, answered",
"work.case.faqTitleA": "What prospects",
"work.case.faqTitleB": "ask us.",
"work.case.nextTitleA": "Facing a similar",
"work.case.nextTitleB": "problem?",
"work.case.nextTextA": "started with one conversation about where their market was heading.",
"work.case.nextTextB": "If your category has the same pattern, the same method applies - the terrain is read before we move.",
"work.case.nextLabel": "Next position",
"work.case.rail.snapshot": "Snapshot",
"work.case.rail.problem": "The problem",
"work.case.rail.solution": "The solution",
"work.case.rail.overcome": "How we overcame",
"work.case.rail.toolbox": "Toolbox",
"work.case.rail.frames": "The frames",
"work.case.rail.results": "Results",
"work.case.rail.faq": "FAQ",
"work.case.rail.next": "Next steps",
};

const WORK_TRUST_SEED: { value: string; label: string }[] = [
  { value: "120+", label: "engagements across Bangladesh and beyond" },
  { value: "8", label: "industries where we've held positions" },
  { value: "5", label: "disciplines, one strategy system" },
];

const HOME_JSON: Record<string, unknown> = {
"home.method.stages": PROCESS_STAGES,
"home.results.stats": STATS,
"home.ticker": INDUSTRIES_TICKER,
"home.tagline.lockup": [
  { word: "Consultancy", stage: "The Read" },
  { word: "Strategy", stage: "The Map" },
  { word: "Solution", stage: "The Build" },
],
};
  for (const [k, v] of Object.entries(HOME_COPY)) {
    await prisma.siteSetting.upsert({ where: { key: k }, update: {}, create: { key: k, value: v } });
  }
  for (const [k, v] of Object.entries(WORK_COPY)) {
    await prisma.siteSetting.upsert({ where: { key: k }, update: {}, create: { key: k, value: v } });
  }
  await prisma.siteSetting.upsert({
    where: { key: "work.page.trust" },
    update: {},
    create: { key: "work.page.trust", value: JSON.stringify(WORK_TRUST_SEED) },
  });
  for (const [k, v] of Object.entries(HOME_JSON)) {
    await prisma.siteSetting.upsert({ where: { key: k }, update: {}, create: { key: k, value: JSON.stringify(v) } });
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