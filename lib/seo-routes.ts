import { prisma } from "./prisma";
import { STATIC_ROUTES } from "./site-routes";

/**
 * Every indexable route with its *effective* snippet, plus the raw override
 * state. Shared by the SEO workspace and the bulk editor so both always show
 * the same numbers.
 */

export type RouteRow = {
  path: string;
  label: string;
  group: string;
  title: string | null;
  description: string | null;
  noindex: boolean;
  schemaType: string | null;
  schema: string[];
  /** True when a SeoMeta row exists for this path. */
  hasOverride: boolean;
  /** Where the snippet comes from — drives the badge in the editor. */
  source: "override" | "setting" | "generated";
};

const DETAIL_SCHEMA: Record<string, string[]> = {
  Services: ["Service", "FAQPage", "BreadcrumbList"],
  "Case studies": ["Article", "FAQPage", "BreadcrumbList"],
  Insights: ["BlogPosting", "FAQPage", "BreadcrumbList"],
};

export async function collectRoutes(): Promise<RouteRow[]> {
  const [services, projects, posts, seo, settings] = await Promise.all([
    prisma.service.findMany({ select: { slug: true, name: true } }).catch(() => []),
    prisma.project.findMany({ select: { slug: true, client: true }, where: { published: true } }).catch(() => []),
    prisma.post.findMany({ select: { slug: true, title: true }, where: { published: true } }).catch(() => []),
    prisma.seoMeta.findMany().catch(() => []),
    prisma.siteSetting
      .findMany({ where: { key: { startsWith: "seo." } }, select: { key: true, value: true } })
      .catch(() => []),
  ]);

  const byPath = new Map(seo.map((s) => [s.path, s]));
  const setting = new Map(settings.map((s) => [s.key, s.value]));
  const defaults = (path: string) => {
    const page = path === "/" ? "home" : path.replace(/^\//, "");
    return {
      title: setting.get(`seo.${page}.title`) ?? null,
      description: setting.get(`seo.${page}.description`) ?? null,
    };
  };

  const rows: RouteRow[] = [];
  const push = (path: string, label: string, group: string, schema: string[]) => {
    const row = byPath.get(path);
    const fallback = defaults(path);
    const fromRow = Boolean(row?.title || row?.description);
    const fromSetting = Boolean(fallback.title || fallback.description);
    rows.push({
      path,
      label,
      group,
      title: row?.title ?? fallback.title,
      description: row?.description ?? fallback.description,
      noindex: row?.noindex ?? false,
      schemaType: row?.schemaType ?? null,
      schema,
      hasOverride: Boolean(row),
      source: fromRow ? "override" : fromSetting ? "setting" : "generated",
    });
  };

  for (const r of STATIC_ROUTES) push(r.path, r.label, r.group, r.schema);
  for (const s of services) push(`/services/${s.slug}`, s.name, "Services", DETAIL_SCHEMA.Services);
  for (const p of projects) push(`/work/${p.slug}`, p.client, "Case studies", DETAIL_SCHEMA["Case studies"]);
  for (const p of posts) push(`/blog/${p.slug}`, p.title, "Insights", DETAIL_SCHEMA.Insights);
  return rows;
}
