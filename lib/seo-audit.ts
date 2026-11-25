import { prisma } from "./prisma";
import { SITE_URL } from "./data";
import { STATIC_ROUTES, TITLE_RANGE, DESC_RANGE } from "./site-routes";
import { clampMeta } from "./text";

/**
 * Site-wide SEO / AEO audit.
 *
 * Everything here is derived from the same data the public site renders
 * (SeoMeta overrides, `seo.*` settings and the content rows), plus a light
 * reachability probe of the files search engines fetch. It is intentionally
 * read-only: the admin health page renders this report, it never mutates.
 */

export type Level = "ok" | "warn" | "bad" | "info";

export type RouteAudit = {
  path: string;
  label: string;
  group: string;
  title: string;
  titleLen: number;
  description: string;
  descLen: number;
  /** "custom" = editor wrote it, "auto" = generated from page content. */
  source: "custom" | "auto";
  noindex: boolean;
  schema: string[];
  issues: { level: Level; message: string; fixHref?: string }[];
};

export type HealthCheck = {
  id: string;
  label: string;
  status: Level;
  detail: string;
  href?: string;
  /** External link (opens in a new tab) rather than an admin route. */
  external?: boolean;
};

export type SeoAudit = {
  routes: RouteAudit[];
  checks: HealthCheck[];
  stats: {
    routes: number;
    indexable: number;
    titled: number;
    described: number;
    custom: number;
    noindex: number;
    withIssues: number;
    dupTitles: number;
    dupDescriptions: number;
  };
  content: {
    postsMissingFaqs: string[];
    projectsMissingFaqs: string[];
    servicesMissingFaqs: string[];
    imagesMissingAlt: number;
    thinPosts: { slug: string; words: number }[];
    postsMissingKeywords: string[];
  };
};

const enc = encodeURIComponent;

async function probe(path: string): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "ZoolyumSeoAudit/1.0" },
    });
    return { ok: res.ok, status: res.status, body: await res.text() };
  } catch {
    return { ok: false, status: 0, body: "" };
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export async function runSeoAudit(): Promise<SeoAudit> {
  const [services, projects, posts, seoRows, settings, redirects, notFound] = await Promise.all([
    prisma.service
      .findMany({ select: { slug: true, name: true, tagline: true, oneParagraph: true, faqs: true }, orderBy: { id: "asc" } })
      .catch(() => []),
    prisma.project
      .findMany({
        select: {
          slug: true,
          client: true,
          title: true,
          result: true,
          challenge: true,
          meta: true,
          images: true,
          published: true,
        },
        orderBy: { sort: "asc" },
      })
      .catch(() => []),
    prisma.post
      .findMany({
        select: {
          slug: true,
          title: true,
          excerpt: true,
          keywords: true,
          faqs: true,
          body: true,
          images: true,
          updated: true,
          published: true,
        },
        orderBy: { date: "desc" },
      })
      .catch(() => []),
    prisma.seoMeta.findMany().catch(() => []),
    prisma.siteSetting
      .findMany({ where: { key: { startsWith: "seo." } }, select: { key: true, value: true } })
      .catch(() => []),
    prisma.redirect.count({ where: { active: true } }).catch(() => 0),
    prisma.notFoundLog.findMany({ orderBy: { hits: "desc" }, take: 5 }).catch(() => []),
  ]);

  const override = new Map(seoRows.map((r) => [r.path, r]));
  const setting = new Map(settings.map((s) => [s.key, s.value]));

  const rows: RouteAudit[] = [];
  const push = (
    path: string,
    label: string,
    group: string,
    generated: { title?: string; description?: string },
    schema: string[],
  ) => {
    const o = override.get(path);
    const key = path === "/" ? "home" : path.replace(/^\//, "");
    const customTitle = o?.title ?? setting.get(`seo.${key}.title`) ?? null;
    const customDesc = o?.description ?? setting.get(`seo.${key}.description`) ?? null;
    const title = customTitle ?? generated.title ?? "";
    const description = customDesc ?? generated.description ?? "";
    const issues: RouteAudit["issues"] = [];
    const fixHref = `/admin/seo/edit?path=${enc(path)}`;

    if (!title) issues.push({ level: "bad", message: "No title tag", fixHref });
    else if (title.length < TITLE_RANGE.min)
      issues.push({ level: "warn", message: `Title is short (${title.length} chars)`, fixHref });
    else if (title.length > TITLE_RANGE.max)
      issues.push({ level: "warn", message: `Title will truncate (${title.length} chars)`, fixHref });

    if (!description) issues.push({ level: "bad", message: "No meta description", fixHref });
    else if (description.length < DESC_RANGE.min)
      issues.push({ level: "warn", message: `Description is short (${description.length} chars)`, fixHref });
    else if (description.length > DESC_RANGE.max)
      issues.push({ level: "warn", message: `Description will truncate (${description.length} chars)`, fixHref });

    if (o?.noindex) issues.push({ level: "warn", message: "Hidden from search (noindex)", fixHref });

    rows.push({
      path,
      label,
      group,
      title,
      titleLen: title.length,
      description,
      descLen: description.length,
      source: customTitle ? "custom" : "auto",
      noindex: Boolean(o?.noindex),
      schema,
      issues,
    });
  };

  for (const r of STATIC_ROUTES) push(r.path, r.label, r.group, {}, r.schema);

  for (const s of services) {
    push(
      `/services/${s.slug}`,
      s.name,
      "Services",
      { title: `${s.name} - ${s.tagline}`, description: clampMeta(s.oneParagraph) },
      ["Service", "BreadcrumbList", "FAQPage"],
    );
  }
  for (const p of projects.filter((x) => x.published)) {
    push(
      `/work/${p.slug}`,
      p.client,
      "Case studies",
      {
        title: `${p.client}: ${p.result}`,
        description: clampMeta(`${p.title}. ${p.challenge} Outcome: ${p.result}.`),
      },
      ["Article", "BreadcrumbList", "FAQPage"],
    );
  }
  for (const p of posts.filter((x) => x.published)) {
    push(`/blog/${p.slug}`, p.title, "Insights", { title: p.title, description: clampMeta(p.excerpt) }, [
      "BlogPosting",
      "BreadcrumbList",
      "FAQPage",
    ]);
  }

  /* ------------------------------ duplicates ------------------------------ */
  const titleGroups = new Map<string, string[]>();
  const descGroups = new Map<string, string[]>();
  for (const r of rows) {
    if (r.noindex) continue;
    if (r.source === "custom" && r.title) {
      const k = r.title.trim().toLowerCase();
      titleGroups.set(k, [...(titleGroups.get(k) ?? []), r.path]);
    }
    if (r.description) {
      const k = r.description.trim().toLowerCase();
      descGroups.set(k, [...(descGroups.get(k) ?? []), r.path]);
    }
  }
  const dupTitles = [...titleGroups.values()].filter((v) => v.length > 1);
  const dupDescs = [...descGroups.values()].filter((v) => v.length > 1);

  /* --------------------------- content quality ---------------------------- */
  const hasFaqs = (v: unknown) => Array.isArray(v) && v.length > 0;
  const metaOf = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
  const imagesOf = (v: unknown) =>
    Array.isArray(v) ? (v as { alt?: string; caption?: string }[]) : [];

  const postsMissingFaqs = posts.filter((p) => p.published && !hasFaqs(p.faqs)).map((p) => p.slug);
  const postsMissingKeywords = posts.filter((p) => p.published && p.keywords.length === 0).map((p) => p.slug);
  const thinPosts = posts
    .filter((p) => p.published)
    .map((p) => ({ slug: p.slug, words: p.body.reduce((n, para) => n + countWords(para), 0) }))
    .filter((p) => p.words < 600);
  const projectsMissingFaqs = projects
    .filter((p) => p.published && !hasFaqs(metaOf(p.meta).faqs))
    .map((p) => p.slug);
  const servicesMissingFaqs = services.filter((s) => !hasFaqs(s.faqs)).map((s) => s.slug);

  let imagesMissingAlt = 0;
  for (const p of projects) {
    for (const img of imagesOf(p.images)) if (!img.alt || !img.alt.trim()) imagesMissingAlt++;
  }
  for (const p of posts) {
    for (const img of imagesOf(p.images)) if (!img.caption || !img.caption.trim()) imagesMissingAlt++;
  }

  /* ------------------------------ file checks ----------------------------- */
  const [robotsTxt, sitemapXml, llmsTxt, feedXml] = await Promise.all([
    probe("/robots.txt"),
    probe("/sitemap.xml"),
    probe("/llms.txt"),
    probe("/feed.xml"),
  ]);

  const sitemapUrls = sitemapXml.body.match(/<loc>/g)?.length ?? 0;
  const gsc = (setting.get("seo.google_verification") ?? "").trim();
  const indexnow = (setting.get("analytics.indexnow_key") ?? "").trim();

  const checks: HealthCheck[] = [
    {
      id: "reachable",
      label: "Site is publicly reachable",
      status: robotsTxt.status === 200 ? "ok" : robotsTxt.status === 0 ? "warn" : "bad",
      detail:
        robotsTxt.status === 200
          ? `${SITE_URL} responds.`
          : robotsTxt.status === 0
            ? `Could not reach ${SITE_URL}. Deploy the site or check the domain.`
            : `Returned HTTP ${robotsTxt.status}.`,
      href: SITE_URL,
      external: true,
    },
    {
      id: "robots",
      label: "robots.txt allows crawling and names the sitemap",
      status: robotsTxt.ok && /sitemap:/i.test(robotsTxt.body) ? "ok" : robotsTxt.ok ? "warn" : "bad",
      detail:
        robotsTxt.ok && /sitemap:/i.test(robotsTxt.body)
          ? "Crawlable, with the sitemap declared."
          : robotsTxt.ok
            ? "robots.txt is reachable but does not declare a sitemap."
            : "robots.txt is unreachable — Google will fall back to defaults.",
      href: `${SITE_URL}/robots.txt`,
      external: true,
    },
    {
      id: "sitemap",
      label: "XML sitemap is valid and lists every page",
      status: sitemapXml.ok && sitemapUrls > 0 ? "ok" : "bad",
      detail: sitemapXml.ok
        ? `${sitemapUrls} URLs in the sitemap; ${rows.filter((r) => !r.noindex).length} indexable routes in the CMS.`
        : "Sitemap is unreachable.",
      href: `${SITE_URL}/sitemap.xml`,
      external: true,
    },
    {
      id: "llms",
      label: "llms.txt is published for answer engines",
      status: llmsTxt.ok && llmsTxt.body.startsWith("#") ? "ok" : "warn",
      detail: llmsTxt.ok ? "Answer-engine index is live at /llms.txt." : "llms.txt is unreachable.",
      href: `${SITE_URL}/llms.txt`,
      external: true,
    },
    {
      id: "feed",
      label: "RSS feed is published",
      status: feedXml.ok && /<rss/i.test(feedXml.body) ? "ok" : "warn",
      detail: feedXml.ok ? "Feed is live at /feed.xml." : "Feed is unreachable.",
      href: `${SITE_URL}/feed.xml`,
      external: true,
    },
    {
      id: "gsc",
      label: "Google Search Console is verified",
      status: gsc ? "ok" : "bad",
      detail: gsc
        ? "Verification token is set and rendered in the <head>."
        : "Add the Search Console token in Settings → Search verification, then submit the sitemap.",
      href: "/admin/settings#seo-other",
    },
    {
      id: "indexnow",
      label: "IndexNow is configured (Bing, Yandex, partners)",
      status: indexnow ? "ok" : "warn",
      detail: indexnow
        ? "Publishing pings IndexNow automatically."
        : "Optional. Add a key in Settings → Analytics to push changes to Bing instantly.",
      href: "/admin/settings#analytics",
    },
    {
      id: "metadata",
      label: "Every indexable route has a title and description",
      status:
        rows.filter((r) => !r.noindex && (!r.title || !r.description)).length === 0
          ? "ok"
          : "bad",
      detail: (() => {
        const missing = rows.filter((r) => !r.noindex && (!r.title || !r.description)).length;
        return missing === 0 ? "All routes publish both." : `${missing} route(s) missing one or both.`;
      })(),
      href: "/admin/seo",
    },
    {
      id: "duplicates",
      label: "No duplicate titles or descriptions",
      status: dupTitles.length === 0 && dupDescs.length === 0 ? "ok" : "warn",
      detail:
        dupTitles.length + dupDescs.length === 0
          ? "Every page has a unique snippet."
          : `${dupTitles.length} duplicate title(s), ${dupDescs.length} duplicate description(s).`,
      href: "/admin/seo",
    },
    {
      id: "noindex",
      label: "No page is accidentally hidden",
      status: rows.some((r) => r.noindex) ? "warn" : "ok",
      detail: rows.some((r) => r.noindex)
        ? `${rows.filter((r) => r.noindex).length} route(s) set to noindex.`
        : "Nothing is excluded from the index.",
      href: "/admin/seo",
    },
    {
      id: "404",
      label: "No broken URLs are being hit",
      status: notFound.length === 0 ? "ok" : "warn",
      detail:
        notFound.length === 0
          ? "No 404s logged."
          : `${notFound[0]?.hits ?? 0} hits on ${notFound[0]?.path ?? "a missing URL"}.`,
      href: "/admin/seo/not-found",
    },
    {
      id: "redirects",
      label: "Redirects cover retired URLs",
      status: redirects > 0 || notFound.length === 0 ? "ok" : "warn",
      detail: redirects > 0 ? `${redirects} active redirect(s).` : "No redirects configured yet.",
      href: "/admin/seo/redirects",
    },
    {
      id: "structured",
      label: "Structured data on every template",
      status: "ok",
      detail:
        "Organization + WebSite site-wide; Service, Article, BlogPosting, FAQPage, JobPosting, Review and BreadcrumbList per template.",
      href: "/admin/seo",
    },
    {
      id: "content",
      label: "Content depth for answer engines",
      status: thinPosts.length === 0 && postsMissingFaqs.length === 0 ? "ok" : "warn",
      detail:
        thinPosts.length + postsMissingFaqs.length === 0
          ? "Every post is long-form and answers questions in FAQ form."
          : `${thinPosts.length} thin post(s), ${postsMissingFaqs.length} post(s) without FAQ.`,
      href: "/admin/posts",
    },
  ];

  const indexable = rows.filter((r) => !r.noindex);
  return {
    routes: rows,
    checks,
    stats: {
      routes: rows.length,
      indexable: indexable.length,
      titled: indexable.filter((r) => r.title).length,
      described: indexable.filter((r) => r.description).length,
      custom: rows.filter((r) => r.source === "custom").length,
      noindex: rows.length - indexable.length,
      withIssues: rows.filter((r) => r.issues.length > 0).length,
      dupTitles: dupTitles.length,
      dupDescriptions: dupDescs.length,
    },
    content: {
      postsMissingFaqs,
      projectsMissingFaqs,
      servicesMissingFaqs,
      imagesMissingAlt,
      thinPosts,
      postsMissingKeywords,
    },
  };
}
