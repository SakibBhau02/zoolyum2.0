import { prisma } from "./prisma";
import { SITE_URL } from "./data";

/** Ensure a path starts with "/" and has no trailing slash (except root). */
export function normalizePath(input: string): string {
  let p = (input ?? "").trim();
  if (!p) return "/";
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname;
    } catch {
      return "/";
    }
  }
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p;
}

export function canonicalUrl(path: string): string {
  return `${SITE_URL}${normalizePath(path) === "/" ? "" : normalizePath(path)}`;
}

/** Default social card. Every route falls back to this so no page ships without one. */
export const OG_IMAGE = `${SITE_URL}/opengraph-image`;

/**
 * Crawler directives applied to every indexable page.
 *
 * `max-image-preview:large` is what lets Google show a full-size thumbnail in
 * Discover and mobile results; `max-snippet:-1` removes the snippet cap that
 * would otherwise truncate answers. Both are ignored by engines that do not
 * understand them, so they are safe to ship globally.
 */
export const indexableRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export const noindexRobots = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

type Crumb = { name: string; path: string };

/**
 * BreadcrumbList JSON-LD. Search engines use it to replace the raw URL in a
 * result with a readable path, which lifts click-through without touching copy.
 */
export function breadcrumbLd(trail: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl(trail[trail.length - 1]?.path ?? "/")}#breadcrumb`,
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

/**
 * WebPage JSON-LD for a static route. `about` links the page to the entity it
 * describes, which is what answer engines read when they quote a page.
 */
export function webPageLd(opts: {
  path: string;
  name: string;
  description: string;
  type?: string;
  dateModified?: string;
}) {
  const url = canonicalUrl(opts.path);
  return {
    "@type": opts.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

/** Combine page nodes into one @graph block. */
export function graph(nodes: unknown[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/**
 * Serialise JSON-LD for a <script> tag.
 *
 * `JSON.stringify` leaves `<` untouched, so a CMS value containing
 * `</script>` could close the tag and inject markup. Escaping it keeps the
 * payload inert without changing what parsers see.
 */
export function jsonLdHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * IndexNow: tell Bing/Yandex (and partners) that a URL changed. Cheap, no auth
 * beyond the key, and it only fires when a key is configured.
 */
export async function pingIndexNow(paths: string[]): Promise<void> {
  try {
    const key = await prisma.siteSetting.findUnique({ where: { key: "analytics.indexnow_key" } });
    const value = key?.value?.trim();
    if (!value || paths.length === 0) return;
    const body = {
      host: new URL(SITE_URL).host,
      key: value,
      keyLocation: `${SITE_URL}/api/indexnow-key`,
      urlList: paths.slice(0, 100).map(canonicalUrl),
    };
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    }).catch(() => {});
  } catch {
    /* indexing hints must never break a publish */
  }
}

/** Best-effort 404 capture, called from not-found.tsx. */
export async function recordNotFound(path: string): Promise<void> {
  try {
    const p = normalizePath(path).slice(0, 512);
    if (p.startsWith("/admin") || p.startsWith("/_next") || p === "/") return;
    await prisma.notFoundLog.upsert({
      where: { path: p },
      update: { hits: { increment: 1 } },
      create: { path: p },
    });
  } catch {
    /* never break the 404 page */
  }
}
