import { cache } from "react";
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
  FILMS,
} from "./data";
import type { Film } from "./data";
import { ARTICLE_BODIES, ARTICLE_SECTIONS } from "./posts-content";
import { parseYoutubeId } from "./text";
import { HOME_FALLBACK } from "./home-copy";
import { BRIEF_DEFAULT, parseBriefScenario } from "./engagement";
import type { BriefScenario } from "./engagement";

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
  updatedAt: string;
  slug: string;
  client: string;
  industry: string;
  services: string[];
  title: string;
  result: string;
  timeline: string;
  images: { src: string; alt: string; kind: "image" | "youtube"; youtubeId?: string }[];
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

const HEADING_PREFIX = "## ";

function deriveSections(slug: string, body: string[]): { heading: string; paras: [number, number] }[] {
  const explicit = ARTICLE_SECTIONS[slug];
  if (explicit && explicit.length > 0) return explicit;
  const out: { heading: string; paras: [number, number] }[] = [];
  let start: number | null = null;
  let heading = "";
  body.forEach((p, i) => {
    if (p.startsWith(HEADING_PREFIX) && p.slice(HEADING_PREFIX.length).trim() !== "") {
      if (start !== null && i - 1 >= start) out.push({ heading, paras: [start, i - 1] });
      heading = p.slice(HEADING_PREFIX.length).trim();
      start = i + 1;
    } else if (start === null) {
      heading = "";
      start = i;
    }
  });
  if (start !== null && body.length - 1 >= start) out.push({ heading, paras: [start, body.length - 1] });
  return out;
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
  updatedAt?: unknown;
}): ContentProject {
  return {
    slug: p.slug, client: p.client, industry: p.industry, services: [...p.services],
    title: p.title, result: p.result, timeline: p.timeline,
    images: arr(p.images, (g: { src: string; alt: string; kind?: unknown; youtubeId?: unknown }) => {
      const kind = g.kind === "youtube" ? "youtube" : "image";
      const fromSrc = kind === "youtube" ? parseYoutubeId(str(g.src)) : "";
      const id = typeof g.youtubeId === "string" && g.youtubeId !== "" ? g.youtubeId : fromSrc;
      return {
        src: str(g.src),
        alt: str(g.alt || `${p.client} image`),
        kind,
        ...(kind === "youtube" && id !== "" ? { youtubeId: id } : {}),
      };
    }),
    challenge: p.challenge, strategy: p.strategy, execution: arr(p.execution, String),
    stats: arr(p.stats, (s: { value: string; label: string }) => ({ value: str(s.value), label: str(s.label) })),
    quote: p.quote, quoteAuthor: p.quoteAuthor, gradient: p.gradient,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : "",
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

async function getPostsRaw(): Promise<ContentPost[]> {
  return first(async () => {
    const rows = await prisma.post.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      // The index only needs card fields; leave the full body to getPostBody.
      select: {
        slug: true, title: true, excerpt: true, category: true, date: true,
        readTime: true, author: true, authorRole: true, cover: true,
        keywords: true, takeaways: true, quote: true, images: true,
      },
    });
    return rows.map((p) => normPost({
      ...p,
      keywords: [...p.keywords],
      takeaways: [...p.takeaways],
      quote: p.quote ?? undefined,
      images: p.images,
    }));
  }, () => POSTS.map(normPost), "getPosts");
}
export const getPosts = cache(getPostsRaw);

export async function getPostSlugs(): Promise<string[]> {
  return first(
    async () => (await prisma.post.findMany({ where: { published: true }, select: { slug: true } })).map((p) => p.slug),
    () => POSTS.map((p) => p.slug),
    "getPostSlugs",
  );
}

export async function getPost(slug: string): Promise<ContentPost | null> {
  return first(async () => {
    const p = await prisma.post.findFirst({
      where: { slug, published: true },
      select: {
        slug: true, title: true, excerpt: true, category: true, date: true,
        readTime: true, author: true, authorRole: true, cover: true,
        keywords: true, takeaways: true, quote: true, images: true,
      },
    });
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
    const p = await prisma.post.findFirst({ where: { slug, published: true }, select: { faqs: true, updated: true, body: true } });
    const faqs = arr(p?.faqs, (f: { q: string; a: string }) => ({ q: str(f.q), a: str(f.a) }));
    return { faqs, updated: p?.updated ?? null, sections: deriveSections(slug, p ? [...p.body] : []) };
  }, () => ({
    faqs: (POST_FAQS[slug] ?? []).map((f) => ({ ...f })),
    updated: POST_UPDATED[slug] ?? null,
    sections: ARTICLE_SECTIONS[slug] ?? [],
  }), `getPostExtras:${slug}`);
}

async function getProjectsRaw(): Promise<ContentProject[]> {
  return first(async () => {
    const rows = await prisma.project.findMany({ where: { published: true }, orderBy: [{ sort: "asc" }, { id: "asc" }] });
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
export const getProjects = cache(getProjectsRaw);

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

async function getServicesRaw(): Promise<ContentService[]> {
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
export const getServices = cache(getServicesRaw);

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
    // Raw columns go straight into normService, which coerces every
    // JSON column with arr(). Pre-mapping them here called .map() on
    // whatever the column held, so one non-array `story` value threw
    // and silently dropped the whole service to the TS fallback.
    return normService({
      ...s,
      proofStat: s.proofStat,
      deliverables: s.deliverables,
      process: s.process,
      faqs: s.faqs,
      story: s.story,
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

async function getSettingRaw(key: string, fallback = "") {
  return first(async () => {
    const s = await prisma.siteSetting.findUnique({ where: { key } });
    return s?.value ?? fallback;
  }, () => fallback, `getSetting:${key}`);
}

/**
 * Request-level memoisation. A single page render reads the same settings a
 * dozen times; React's cache collapses those into one query per request.
 */
export const getSetting = cache(getSettingRaw);

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
import { NAV_LINKS, PROCESS_STAGES, STATS, INDUSTRIES_TICKER } from "./data";
import { OG_IMAGE, indexableRobots, noindexRobots } from "./seo";

/**
 * SEO metadata backed by SiteSetting overrides (seo.{route}.title and
 * seo.{route}.description), with a per-route `SeoMeta` override on top.
 * Empty SeoMeta fields fall back to the setting, then to the shipped copy.
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
  const [title, description, override] = await Promise.all([
    getSetting(`seo.${route}.title`, fb.title),
    getSetting(`seo.${route}.description`, fb.description),
    getSeoOverride(fb.canonical),
  ]);
  const finalTitle = override?.title ?? title;
  const finalDescription = override?.description ?? description;
  const canonical = override?.canonical || fb.canonical;
  const ogTitle = fb.ogTitle ?? finalTitle;
  const ogDescription = fb.ogDescription ?? finalDescription;
  const ogImage = override?.ogImage || OG_IMAGE;
  return {
    title: override?.title ? { absolute: override.title } : title,
    description: finalDescription,
    alternates: { canonical },
    robots: override?.noindex ? noindexRobots : indexableRobots,
    ...(override?.keywords.length ? { keywords: override.keywords } : {}),
    openGraph: {
      type: "website",
      siteName: "Zoolyum",
      locale: "en_US",
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      // Every route ships a 1200×630 card, so the large variant is always
      // correct — a "summary" card would crop it to a thumbnail.
      card: "summary_large_image",
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
  // Empty fallbacks on purpose: a placeholder root URL (https://facebook.com)
  // would ship as a sameAs claim and as a footer link that goes nowhere useful.
  const [linkedin, facebook, instagram, youtube, x] = await Promise.all([
    getSetting("social.linkedin", ""),
    getSetting("social.facebook", ""),
    getSetting("social.instagram", ""),
    getSetting("social.youtube", ""),
    getSetting("social.x", ""),
  ]);
  return { linkedin, facebook, instagram, youtube, x };
}


export { HOME_FALLBACK } from "./home-copy";

export async function getHomeCopy(): Promise<Record<string, string>> {
  return first(async () => {
    const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "home." } } });
    const out: Record<string, string> = { ...HOME_FALLBACK };
    for (const r of rows) out[r.key] = r.value;
    return out;
  }, () => ({ ...HOME_FALLBACK }), "getHomeCopy");
}

const WORK_FALLBACK: Record<string, string> = {
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

const WORK_TRUST: { value: string; label: string }[] = [
  { value: "120+", label: "engagements across Bangladesh and beyond" },
  { value: "8", label: "industries where we've held positions" },
  { value: "5", label: "disciplines, one strategy system" },
];

export async function getWorkCopy(): Promise<Record<string, string>> {
  return first(async () => {
    const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "work." } } });
    const out: Record<string, string> = { ...WORK_FALLBACK };
    for (const r of rows) out[r.key] = r.value;
    return out;
  }, () => ({ ...WORK_FALLBACK }), "getWorkCopy");
}

export async function getWorkTrust(): Promise<{ value: string; label: string }[]> {
  const rows = await getJsonSetting("work.page.trust", [...WORK_TRUST]);
  return rows.map((t) => ({ value: String(t.value ?? ""), label: String(t.label ?? "") }));
}

export async function getTicker(): Promise<string[]> {
  return getJsonSetting("home.ticker", [...INDUSTRIES_TICKER]);
}

export type NewsCopy = { placeholder: string; button: string; disclaimer: string; success: string; label: string };

export async function getNewsCopy(): Promise<NewsCopy> {
  const [placeholder, button, disclaimer, success, label] = await Promise.all([
    getSetting("home.news.placeholder", "Your email"),
    getSetting("home.news.button", "Subscribe"),
    getSetting("home.news.disclaimer", "No spam, no sharing, unsubscribe anytime."),
    getSetting("home.news.success", "You're on the list. First insight arrives next month."),
    getSetting("home.news.label", "Email address"),
  ]);
  return { placeholder, button, disclaimer, success, label };
}

/** Chapter 01's interactive scenario. The CMS row is authoritative; an
 *  invalid or missing row falls back to the shipped engagement. */
export async function getBriefScenario(): Promise<BriefScenario> {
  const raw = await getSetting("home.brief.scenario", "");
  if (!raw) return BRIEF_DEFAULT;
  try {
    return parseBriefScenario(JSON.parse(raw)) ?? BRIEF_DEFAULT;
  } catch {
    console.warn("[content] home.brief.scenario is not valid JSON — using the shipped brief");
    return BRIEF_DEFAULT;
  }
}

/** The screening room playlist. `youtubeId` accepts a bare id or any *  watch / youtu.be / shorts URL — it is normalised here so the admin
 *  can paste whatever the client sends. */
export async function getHomeFilms(): Promise<Film[]> {
  const rows = await getJsonSetting<unknown>("home.work.films", [...FILMS]);
  if (!Array.isArray(rows)) return [];
  return rows.map((raw) => {
    const f = (raw ?? {}) as Record<string, unknown>;
    return {
      youtubeId: parseYoutubeId(typeof f.youtubeId === "string" ? f.youtubeId : ""),
      title: str(f.title),
      client: str(f.client),
      kind: str(f.kind),
      duration: str(f.duration),
      blurb: str(f.blurb),
      projectSlug: str(f.projectSlug),
    };
  }).filter((f) => f.title !== "" || f.client !== "");
}

export async function getHomeStages(): Promise<{ num: string; title: string; detail: string; outputs: string[] }[]> {
  const rows = await getJsonSetting("home.method.stages", [...PROCESS_STAGES]);
  return rows.map((s) => ({ num: s.num, title: s.title, detail: s.detail, outputs: [...s.outputs] }));
}

export async function getHomeStats(): Promise<{ value: number; suffix: string; label: string }[]> {
  const rows = await getJsonSetting("home.results.stats", [...STATS]);
  return rows.map((s) => ({ value: s.value, suffix: s.suffix, label: s.label }));
}

/* --------------------------------------------------------------------------
 * Per-route SEO overrides.
 *
 * Pages keep their built-in defaults; a row in `SeoMeta` only overrides the
 * fields that were explicitly filled in the admin. This is what makes the
 * "SEO & AEO" workspace affect real <head> output.
 * ------------------------------------------------------------------------ */

export type SeoOverride = {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  canonical: string | null;
  noindex: boolean;
  keywords: string[];
  schemaType: string | null;
  schemaJson: unknown;
};

async function getSeoOverrideRaw(path: string): Promise<SeoOverride | null> {
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  try {
    const row = await prisma.seoMeta.findUnique({ where: { path: clean } });
    if (!row) return null;
    return {
      title: row.title,
      description: row.description,
      ogImage: row.ogImage,
      canonical: row.canonical,
      noindex: row.noindex,
      keywords: [...row.keywords],
      schemaType: row.schemaType,
      schemaJson: row.schemaJson,
    };
  } catch {
    return null;
  }
}

export const getSeoOverride = cache(getSeoOverrideRaw);

