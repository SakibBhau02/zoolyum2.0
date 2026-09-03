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
  images: string[];
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
  keywords: readonly string[]; takeaways: readonly string[];
  quote?: string; images?: readonly { src: string; caption: string }[];
}): ContentPost {
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category,
    date: p.date, readTime: p.readTime, author: p.author, authorRole: p.authorRole,
    cover: p.cover, keywords: [...p.keywords], takeaways: [...p.takeaways],
    quote: p.quote, images: p.images?.map((i) => ({ src: i.src, caption: i.caption })),
  };
}

function normProject(p: {
  slug: string; client: string; industry: string; services: readonly string[];
  title: string; result: string; timeline: string; images: readonly string[];
  challenge: string; strategy: string; execution: readonly string[];
  stats: readonly { value: string; label: string }[]; quote?: string;
  quoteAuthor?: string; gradient: string;
  meta?: {
    overview: string; obstacles: readonly { title: string; how: string }[];
    toolbox: readonly string[]; deliverables: readonly string[];
    faqs: readonly { q: string; a: string }[];
  };
}): ContentProject {
  return {
    slug: p.slug, client: p.client, industry: p.industry, services: [...p.services],
    title: p.title, result: p.result, timeline: p.timeline, images: [...p.images],
    challenge: p.challenge, strategy: p.strategy, execution: [...p.execution],
    stats: p.stats.map((s) => ({ value: s.value, label: s.label })),
    quote: p.quote, quoteAuthor: p.quoteAuthor, gradient: p.gradient,
    meta: p.meta ? {
      overview: p.meta.overview,
      obstacles: p.meta.obstacles.map((o) => ({ title: o.title, how: o.how })),
      toolbox: [...p.meta.toolbox], deliverables: [...p.meta.deliverables],
      faqs: p.meta.faqs.map((f) => ({ q: f.q, a: f.a })),
    } : undefined,
  };
}

export async function getPosts(): Promise<ContentPost[]> {
  return first(async () => {
    const rows = await prisma.post.findMany({ orderBy: { date: "desc" } });
    return rows.map((p) => normPost({
      ...p,
      keywords: [...p.keywords],
      takeaways: [...p.takeaways],
      quote: p.quote ?? undefined,
      images: ((p.images as { src: string; caption: string }[] | null) ?? []).map((i) => ({ ...i })),
    }));
  }, () => POSTS.map(normPost), "getPosts");
}

export async function getPostSlugs(): Promise<string[]> {
  return first(
    async () => (await prisma.post.findMany({ select: { slug: true } })).map((p) => p.slug),
    () => POSTS.map((p) => p.slug),
    "getPostSlugs",
  );
}

export async function getPost(slug: string): Promise<ContentPost | null> {
  return first(async () => {
    const p = await prisma.post.findUnique({ where: { slug } });
    if (!p) return null;
    return normPost({
      ...p,
      keywords: [...p.keywords],
      takeaways: [...p.takeaways],
      quote: p.quote ?? undefined,
      images: ((p.images as { src: string; caption: string }[] | null) ?? []).map((i) => ({ ...i })),
    });
  }, () => {
    const p = POSTS.find((x) => x.slug === slug);
    return p ? normPost(p) : null;
  }, `getPost:${slug}`);
}

export async function getPostBody(slug: string): Promise<string[]> {
  return first(async () => {
    const p = await prisma.post.findUnique({ where: { slug }, select: { body: true } });
    return p ? [...p.body] : [];
  }, () => [...(ARTICLE_BODIES[slug] ?? [])], `getPostBody:${slug}`);
}

export async function getPostExtras(slug: string): Promise<{
  faqs: { q: string; a: string }[];
  updated: string | null;
  sections: { heading: string; paras: [number, number] }[];
}> {
  return first(async () => {
    const p = await prisma.post.findUnique({ where: { slug }, select: { faqs: true, updated: true } });
    const faqs = ((p?.faqs as { q: string; a: string }[] | null) ?? []).map((f) => ({ ...f }));
    return { faqs, updated: p?.updated ?? null, sections: ARTICLE_SECTIONS[slug] ?? [] };
  }, () => ({
    faqs: (POST_FAQS[slug] ?? []).map((f) => ({ ...f })),
    updated: POST_UPDATED[slug] ?? null,
    sections: ARTICLE_SECTIONS[slug] ?? [],
  }), `getPostExtras:${slug}`);
}

export async function getProjects(): Promise<ContentProject[]> {
  return first(async () => {
    const rows = await prisma.project.findMany();
    return rows.map((p) => normProject({
      ...p,
      services: [...p.services],
      images: [...p.images],
      execution: [...p.execution],
      stats: (p.stats as { value: string; label: string }[]).map((s) => ({ ...s })),
      quote: p.quote ?? undefined,
      quoteAuthor: p.quoteAuthor ?? undefined,
      meta: (p.meta as ContentProject["meta"]) ?? undefined,
    }));
  }, () => PROJECTS.map((p) => normProject({ ...p, meta: PROJECT_META[p.slug] })), "getProjects");
}

export async function getProjectSlugs(): Promise<string[]> {
  return first(
    async () => (await prisma.project.findMany({ select: { slug: true } })).map((p) => p.slug),
    () => PROJECTS.map((p) => p.slug),
    "getProjectSlugs",
  );
}

export async function getProject(slug: string): Promise<ContentProject | null> {
  return first(async () => {
    const p = await prisma.project.findUnique({ where: { slug } });
    if (!p) return null;
    return normProject({
      ...p,
      services: [...p.services],
      images: [...p.images],
      execution: [...p.execution],
      stats: (p.stats as { value: string; label: string }[]).map((s) => ({ ...s })),
      quote: p.quote ?? undefined,
      quoteAuthor: p.quoteAuthor ?? undefined,
      meta: (p.meta as ContentProject["meta"]) ?? undefined,
    });
  }, () => {
    const p = PROJECTS.find((x) => x.slug === slug);
    return p ? normProject({ ...p, meta: PROJECT_META[slug] }) : null;
  }, `getProject:${slug}`);
}

type ContentService = (typeof SERVICES)[number];

function normService(s: {
  slug: string; name: string; tagline: string; heroCopy: string;
  oneParagraph: string; situation: string; noise: string; position: string;
  problem: string; solution: string;
  proofStat: { value: string; label: string };
  deliverables: readonly string[];
  process: readonly { step: string; detail: string }[];
  faqs: readonly { q: string; a: string }[];
  story?: readonly { label: string; title: string; body: string }[] | null;
}): ContentService {
  return {
    slug: s.slug, name: s.name, tagline: s.tagline, heroCopy: s.heroCopy,
    oneParagraph: s.oneParagraph, situation: s.situation, noise: s.noise,
    position: s.position, problem: s.problem, solution: s.solution,
    proofStat: { ...s.proofStat },
    deliverables: [...s.deliverables],
    process: s.process.map((x) => ({ ...x })),
    faqs: s.faqs.map((x) => ({ ...x })),
    story: s.story?.map((x) => ({ ...x })),
  } as ContentService;
}

export async function getServices(): Promise<ContentService[]> {
  return first(async () => {
    const rows = await prisma.service.findMany();
    return rows.map((s) =>
      normService({
        ...s,
        proofStat: s.proofStat as { value: string; label: string },
        deliverables: [...s.deliverables],
        process: (s.process as { step: string; detail: string }[]).map((x) => ({ ...x })),
        faqs: (s.faqs as { q: string; a: string }[]).map((x) => ({ ...x })),
        story: (s.story as { label: string; title: string; body: string }[] | null)?.map((x) => ({ ...x })) ?? null,
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
      deliverables: [...s.deliverables],
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
      (await prisma.job.findMany({ where: { active: true } })).map((j) => ({
        title: j.title, type: j.type, location: j.location, dept: j.dept,
        detail: j.detail as { about: string; responsibilities: string[]; requirements: string[]; niceToHave: string[]; success90: string } | null,
      })),
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
import { SITE_URL } from "./data";

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