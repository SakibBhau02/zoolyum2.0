import { prisma } from "./prisma";
import {
  POSTS,
  PROJECTS,
  SERVICES,
  TEAM,
  JOBS,
  TESTIMONIALS,
  POST_FAQS,
  POST_UPDATED,
  PROJECT_META,
  JOB_DETAILS,
} from "./data";
import { ARTICLE_BODIES, ARTICLE_SECTIONS } from "./posts-content";

/**
 * DB-first content accessors with TypeScript fallback.
 * Production path is always the database; the fallback only fires
 * when the database is unreachable (local dev safety) and logs loudly.
 */

export type ContentPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  cover: string;
  keywords: string[];
  takeaways: string[];
  quote?: string;
  images?: { src: string; caption: string }[];
};

export type ContentProject = {
  slug: string;
  client: string;
  industry: string;
  services: string[];
  title: string;
  result: string;
  timeline: string;
  images: { src: string; alt: string }[];
  challenge: string;
  strategy: string;
  execution: string[];
  stats: { value: string; label: string }[];
  quote?: string;
  quoteAuthor?: string;
  gradient: string;
  meta?: {
    overview: string;
    obstacles: { title: string; how: string }[];
    toolbox: string[];
    deliverables: string[];
    faqs: { q: string; a: string }[];
  };
};

function arr<T, U>(v: unknown, map: (x: T) => U): U[] {
  return Array.isArray(v) ? (v as T[]).map(map) : [];
}

function str(v: unknown, fb = ""): string {
  return typeof v === "string" ? v : fb;
}

async function first<T>(fn: () => Promise<T>, fallback: () => T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn(`[content] DB unreachable for ${label}, using TS fallback`, e);
    return fallback();
  }
}

function normPost(p: {
  slug: string; title: string; excerpt: string; category: string; date: string;
  readTime: string; author: string; authorRole: string; cover: string;
  keywords: unknown; takeaways: unknown;
  quote?: string; images?: unknown;
}): ContentPost {
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category,
    date: p.date, readTime: p.readTime, author: p.author, authorRole: p.authorRole,
    cover: p.cover, keywords: arr(p.keywords, String), takeaways: arr(p.takeaways, String),
    quote: p.quote, images: arr(p.images, (i: { src: string; caption: string }) => ({ src: str(i.src), caption: str(i.caption) })),
  };
}

function normProject(p: {
  slug: string; client: string; industry: string; services: readonly string[];
  title: string; result: string; timeline: string; images: unknown;
  challenge: string; strategy: string; execution: readonly string[];
  stats: unknown; quote?: string;
  quoteAuthor?: string; gradient: string;
  meta?: unknown;
}): ContentProject {
  return {
    slug: p.slug, client: p.client, industry: p.industry, services: [...p.services],
    title: p.title, result: p.result, timeline: p.timeline,
    images: arr(p.images, (g: { src: string; alt: string }) => ({ src: str(g.src), alt: str(g.alt || `${p.client} image`) })),
    challenge: p.challenge, strategy: p.strategy, execution: arr(p.execution, String),
    stats: arr(p.stats, (s: { value: string; label: string }) => ({ value: str(s.value), label: str(s.label) })),
    quote: p.quote, quoteAuthor: p.quoteAuthor, gradient: p.gradient,
    meta: (() => {
      const m = p.meta as {
        overview?: unknown; obstacles?: unknown; toolbox?: unknown;
        deliverables?: unknown; faqs?: unknown;
      } | null | undefined;
      if (!m || typeof m !== "object") return undefined;
      return {
        overview: str(m.overview),
        obstacles: arr(m.obstacles, (o: { title: string; how: string }) => ({ title: str(o.title), how: str(o.how) })),
        toolbox: arr(m.toolbox, String),
        deliverables: arr(m.deliverables, String),
        faqs: arr(m.faqs, (f: { q: string; a: string }) => ({ q: str(f.q), a: str(f.a) })),
      };
    })(),
  };
}

export async function getPosts(): Promise<ContentPost[]> {
  return first(async () => {
    const rows = await prisma.post.findMany({ where: { published: true }, orderBy: { date: "desc" } });
    return rows.map((p) => normPost({
      ...p,
      keywords: [...p.keywords],
      takeaways: [...p.takeaways],
      quote: p.quote ?? undefined,
      images: p.images,
    }));
  }, () => POSTS.map(normPost), "getPosts");
}

export async function getPostSlugs(): Promise<string[]> {
  return first(
    async () => (await prisma.post.findMany({ where: { published: true }, select: { slug: true } })).map((p) => p.slug),
    () => POSTS.map((p) => p.slug),
    "getPostSlugs",
  );
}

export async function getPost(slug: string): Promise<ContentPost | null> {
  return first(async () => {
    const p = await prisma.post.findFirst({ where: { slug, published: true } });
    if (!p) return null;
    return normPost({
      ...p,
      keywords: [...p.keywords],
      takeaways: [...p.takeaways],
      quote: p.quote ?? undefined,
      images: p.images,
    });
  }, () => {
    const p = POSTS.find((x) => x.slug === slug);
    return p ? normPost(p) : null;
  }, `getPost:${slug}`);
}

export async function getPostBody(slug: string): Promise<string[]> {
  return first(async () => {
    const p = await prisma.post.findFirst({ where: { slug, published: true }, select: { body: true } });
    return p ? [...p.body] : [];
  }, () => [...(ARTICLE_BODIES[slug] ?? [])], `getPostBody:${slug}`);
}

export async function getPostExtras(slug: string): Promise<{
  faqs: { q: string; a: string }[];
  updated: string | null;
  sections: { heading: string; paras: [number, number] }[];
}> {
  return first(async () => {
    const p = await prisma.post.findFirst({ where: { slug, published: true }, select: { faqs: true, updated: true } });
    const faqs = arr(p?.faqs, (f: { q: string; a: string }) => ({ q: str(f.q), a: str(f.a) }));
    return { faqs, updated: p?.updated ?? null, sections: ARTICLE_SECTIONS[slug] ?? [] };
  }, () => ({
    faqs: (POST_FAQS[slug] ?? []).map((f) => ({ ...f })),
    updated: POST_UPDATED[slug] ?? null,
    sections: ARTICLE_SECTIONS[slug] ?? [],
  }), `getPostExtras:${slug}`);
}

export async function getProjects(): Promise<ContentProject[]> {
  return first(async () => {
    const rows = await prisma.project.findMany({ where: { published: true } });
    return rows.map((p) => normProject({
      ...p,
      services: [...p.services],
      images: p.images,
      execution: [...p.execution],
      stats: p.stats,
      quote: p.quote ?? undefined,
      quoteAuthor: p.quoteAuthor ?? undefined,
      meta: p.meta,
    }));
  }, () => PROJECTS.map((p) => normProject({ ...p, images: p.images.map((src, i) => ({ src, alt: `${p.client} case image ${i + 1}` })), meta: PROJECT_META[p.slug] })), "getProjects");
}

export async function getProjectSlugs(): Promise<string[]> {
  return first(
    async () => (await prisma.project.findMany({ where: { published: true }, select: { slug: true } })).map((p) => p.slug),
    () => PROJECTS.map((p) => p.slug),
    "getProjectSlugs",
  );
}

export async function getProject(slug: string): Promise<ContentProject | null> {
  return first(async () => {
    const p = await prisma.project.findFirst({ where: { slug, published: true } });
    if (!p) return null;
    return normProject({
      ...p,
      services: [...p.services],
      images: p.images,
      execution: [...p.execution],
      stats: p.stats,
      quote: p.quote ?? undefined,
      quoteAuthor: p.quoteAuthor ?? undefined,
      meta: p.meta,
    });
  }, () => {
    const p = PROJECTS.find((x) => x.slug === slug);
    return p ? normProject({ ...p, images: p.images.map((src, i) => ({ src, alt: `${p.client} case image ${i + 1}` })), meta: PROJECT_META[slug] }) : null;
  }, `getProject:${slug}`);
}

type ContentService = (typeof SERVICES)[number];

function normService(s: {
  slug: string; name: string; tagline: string; heroCopy: string;
  oneParagraph: string; situation: string; noise: string; position: string;
  problem: string; solution: string;
  proofStat: unknown;
  deliverables: unknown;
  process: unknown;
  faqs: unknown;
  story?: unknown;
}): ContentService {
  return {
    slug: s.slug, name: s.name, tagline: s.tagline, heroCopy: s.heroCopy,
    oneParagraph: s.oneParagraph, situation: s.situation, noise: s.noise,
    position: s.position, problem: s.problem, solution: s.solution,
    proofStat: (() => {
      const ps = s.proofStat as { value?: unknown; label?: unknown } | null;
      return ps && typeof ps.value === "string"
        ? { value: ps.value, label: str(ps.label) }
        : { value: "", label: "" };
    })(),
    deliverables: arr(s.deliverables, String),
    process: arr(s.process, (x: { step: string; detail: string }) => ({ step: str(x.step), detail: str(x.detail) })),
    faqs: arr(s.faqs, (x: { q: string; a: string }) => ({ q: str(x.q), a: str(x.a) })),
    story: arr(s.story ?? [], (x: { label: string; title: string; body: string }) => ({
      label: str(x.label), title: str(x.title), body: str(x.body),
    })),
  } as ContentService;
}

export async function getServices(): Promise<ContentService[]> {
  return first(async () => {
    const rows = await prisma.service.findMany();
    return rows.map((s) =>
      normService({
        ...s,
        proofStat: s.proofStat as { value: string; label: string },
        deliverables: arr(s.deliverables, String),
        process: s.process,
        faqs: s.faqs,
        story: s.story,
      }),
    );
  }, () => SERVICES.map((s) => normService({ ...s })), "getServices");
}

export async function getServiceSlugs(): Promise<string[]> {
  return first(
    async () => (await prisma.service.findMany({ select: { slug: true } })).map((s) => s.slug),
    () => SERVICES.map((s) => s.slug),
    "getServiceSlugs",
  );
}

export async function getService(slug: string): Promise<ContentService | null> {
  return first(async () => {
    const s = await prisma.service.findUnique({ where: { slug } });
    if (!s) return null;
    return normService({
      ...s,
      proofStat: s.proofStat as { value: string; label: string },
      deliverables: arr(s.deliverables, String),
      process: (s.process as { step: string; detail: string }[]).map((x) => ({ ...x })),
      faqs: (s.faqs as { q: string; a: string }[]).map((x) => ({ ...x })),
      story: (s.story as { label: string; title: string; body: string }[] | null)?.map((x) => ({ ...x })) ?? null,
    });
  }, () => {
    const s = SERVICES.find((x) => x.slug === slug);
    return s ? normService({ ...s }) : null;
  }, `getService:${slug}`);
}

export async function getTeam(): Promise<{ name: string; role: string; expertise: string; initials: string }[]> {
  return first(
    async () =>
      (await prisma.teamMember.findMany({ orderBy: { sort: "asc" } })).map((m) => ({
        name: m.name, role: m.role, expertise: m.expertise, initials: m.initials,
      })),
    () => TEAM.map((m) => ({ name: m.name, role: m.role, expertise: m.expertise, initials: m.initials })),
    "getTeam",
  );
}

export async function getJobs() {
  return first(
    async () =>
      (await prisma.job.findMany({ where: { active: true } })).map((j) => {
        const d = j.detail as {
          about?: unknown; responsibilities?: unknown; requirements?: unknown;
          niceToHave?: unknown; success90?: unknown;
        } | null;
        const detail =
          d && typeof d === "object" && !Array.isArray(d) && typeof d.about === "string"
            ? {
                about: d.about,
                responsibilities: arr(d.responsibilities, String),
                requirements: arr(d.requirements, String),
                niceToHave: arr(d.niceToHave, String),
                success90: str(d.success90),
              }
            : null;
        return { title: j.title, type: j.type, location: j.location, dept: j.dept, detail };
      }), 
    () => JOBS.map((j) => ({ ...j, detail: JOB_DETAILS[j.title] })),
    "getJobs",
  );
}

export async function getTestimonials(): Promise<{ quote: string; author: string; company: string; industry: string }[]> {
  return first(
    async () =>
      (await prisma.testimonial.findMany({ orderBy: { sort: "asc" } })).map((t) => ({
        quote: t.quote, author: t.author, company: t.company, industry: t.industry,
      })),
    () => TESTIMONIALS.map((t) => ({ quote: t.quote, author: t.author, company: t.company, industry: t.industry })),
    "getTestimonials",
  );
}

export async function getSetting(key: string, fallback = "") {
  return first(async () => {
    const s = await prisma.siteSetting.findUnique({ where: { key } });
    return s?.value ?? fallback;
  }, () => fallback, `getSetting:${key}`);
}

export async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const raw = await getSetting(key, "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getContactInfo() {
  const [email, phone, address, mapUrl] = await Promise.all([
    getSetting("contact.email", "hello@zoolyum.com"),
    getSetting("contact.phone", "+880 1700-000000"),
    getSetting("contact.address", "House 11, Road 11, Mirpur 11, Dhaka 1216, Bangladesh"),
    getSetting("contact.mapUrl", "https://maps.google.com/?q=Mirpur+11,+Dhaka"),
  ]);
  return { email, phone, address, mapUrl };
}import type { Metadata } from "next";
import { NAV_LINKS, SITE_URL, PROCESS_STAGES, STATS, INDUSTRIES_TICKER } from "./data";

/**
 * SEO metadata backed by SiteSetting overrides (seo.{route}.title and
 * seo.{route}.description), falling back to the shipped copy.
 */
export async function pageMeta(
  route: string,
  fb: {
    title: string;
    description: string;
    canonical: string;
    ogTitle?: string;
    ogDescription?: string;
    card?: "summary" | "summary_large_image";
  },
): Promise<Metadata> {
  const [title, description] = await Promise.all([
    getSetting(`seo.${route}.title`, fb.title),
    getSetting(`seo.${route}.description`, fb.description),
  ]);
  const ogTitle = fb.ogTitle ?? `${title} | Zoolyum`;
  const ogDescription = fb.ogDescription ?? description;
  const ogImage = `${SITE_URL}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: fb.canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: fb.canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: fb.card ?? "summary",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}
export type MenuLinkItem = { id: number; label: string; href: string; group: string; sort: number; visible: boolean };

export async function getMenuLinks(group?: string): Promise<MenuLinkItem[]> {
  return first(async () => {
    const rows = await prisma.menuLink.findMany({
      where: { ...(group ? { group } : {}), visible: true },
      orderBy: { sort: "asc" },
    });
    return rows.map((r) => ({ id: r.id, label: r.label, href: r.href, group: r.group, sort: r.sort, visible: r.visible }));
  }, () => NAV_LINKS.filter(() => !group || group === "header" || group === "explore").map((l, i) => ({ id: i, label: l.label, href: l.href, group: group ?? "header", sort: i, visible: true })), `getMenuLinks:${group ?? "all"}`);
}

export async function getSocials(): Promise<Record<string, string>> {
  const [linkedin, facebook, instagram, youtube] = await Promise.all([
    getSetting("social.linkedin", "https://linkedin.com"),
    getSetting("social.facebook", "https://facebook.com"),
    getSetting("social.instagram", "https://instagram.com"),
    getSetting("social.youtube", "https://youtube.com"),
  ]);
  return { linkedin, facebook, instagram, youtube };
}


const HOME_FALLBACK: Record<string, string> = {
"home.hero.eyebrow": "Consultancy. Strategy. Solution.",
"home.hero.titleA": "Every market looks",
"home.hero.titleAccent": "crowded",
"home.hero.titleB": "from the outside.",
"home.hero.sub": "Every market has a pattern. Most brands react to it. We help you read it first - and act while others are still guessing.",
"home.hero.ctaPrimary": "Start a Conversation",
"home.hero.ctaSecondary": "See Our Work",
"home.hero.hint": "THE NOISE BEGINS BELOW",
"home.hero.meter": "MARKET NOISE",
"home.hero.beatB": "Most brands respond to that by shouting|louder.",
"home.hero.beatC": "In the fog, most brands start to|look the same.",
"home.hero.beatD": "In that noise, only one|line|ever cuts through.",
"home.tagline.openerA": "Three words.",
"home.tagline.openerB": "The entire method.",
"home.tagline.openerSub": "Not a slogan - a sequence. Every engagement runs through all three, in order.",
"home.tagline.act1.sub": "The diagnosis comes before the prescription.",
"home.tagline.act1.body": "We start as the outside eye. Before any deliverable exists, we read your market, competitors, and buyers - until the pattern under the noise is plain. The first deliverable is the advice itself: a read you could act on without us.",
"home.tagline.act2.sub": "A position you can defend - chosen, not wished for.",
"home.tagline.act2.body": "Reading is not enough. Strategy is choosing the one piece of ground your brand can hold and no competitor can copy - then aiming every touchpoint at it. The crowd clusters where it is loud. We position where it is defensible.",
"home.tagline.act3.sub": "Execution that carries the thinking - all the way out.",
"home.tagline.act3.body": "Identity, interface, and campaign, built as one system - so the strategy survives contact with the market. This is where the reading and the choosing become something your customers can see, feel, and act on.",
"home.tagline.lockupNote": "One thread runs through all three - the sequence every Zoolyum engagement is built on.",
"home.tagline.cta": "See the disciplines behind each word",
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
"home.voices.eyebrow": "What Clients Say",
"home.voices.title": "In their |words.",
"home.voices.newsEyebrow": "One insight a month",
"home.voices.newsTitle": "One strategic insight a month. |No noise.",
"home.voices.newsLead": "The same discipline we bring to client work, in an email. Reading time: four minutes. Everything else: nothing.",
"home.cta.eyebrow": "Let us Read Your Market Together",
"home.cta.title": "Somewhere in your market, there is a pattern only a strategist would notice. |Let us find it.",
"home.cta.lead": "One conversation. Thirty minutes. We will show you where your brand blends in - and what it takes to stand apart.",
"home.cta.primary": "Start a Conversation",
"home.cta.secondary": "Explore Our Services",
};

export async function getHomeCopy(): Promise<Record<string, string>> {
  return first(async () => {
    const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "home." } } });
    const out: Record<string, string> = { ...HOME_FALLBACK };
    for (const r of rows) out[r.key] = r.value;
    return out;
  }, () => ({ ...HOME_FALLBACK }), "getHomeCopy");
}

export async function getTicker(): Promise<string[]> {
  return getJsonSetting("home.ticker", [...INDUSTRIES_TICKER]);
}

export async function getHomeStages(): Promise<{ num: string; title: string; detail: string; outputs: string[] }[]> {
  const rows = await getJsonSetting("home.method.stages", [...PROCESS_STAGES]);
  return rows.map((s) => ({ num: s.num, title: s.title, detail: s.detail, outputs: [...s.outputs] }));
}

export async function getHomeStats(): Promise<{ value: number; suffix: string; label: string }[]> {
  const rows = await getJsonSetting("home.results.stats", [...STATS]);
  return rows.map((s) => ({ value: s.value, suffix: s.suffix, label: s.label }));
}
