import type { MetadataRoute } from "next";
import { POSTS, POST_UPDATED, SITE_URL } from "@/lib/data";
import { getProjectSlugs, getServiceSlugs } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // No lastModified on the static routes: stamping them with the build time
  // told Google every page changed on every deploy, which makes lastmod
  // worthless. Real timestamps are used where we actually have one (posts).
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/work", priority: 0.9, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/team", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
    { path: "/process", priority: 0.7, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { path: "/testimonials", priority: 0.5, changeFrequency: "monthly" },
    { path: "/careers", priority: 0.4, changeFrequency: "monthly" },
    { path: "/resources", priority: 0.6, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/newsletter", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms-of-service", priority: 0.2, changeFrequency: "yearly" },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: r.priority,
  }));

  // DB-first slugs (static TS fallback inside the getters), so CMS-added
  // services / case studies appear in the sitemap without a redeploy.
  // `lastmod` is real where we have it, and noindex routes are excluded.
  const [serviceRows, projectRows, noindexRows] = await Promise.all([
    prisma.service.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
    prisma.seoMeta.findMany({ where: { noindex: true }, select: { path: true } }).catch(() => []),
  ]);
  const noindex = new Set(noindexRows.map((row) => row.path));

  const serviceList =
    serviceRows.length > 0
      ? serviceRows
      : (await getServiceSlugs()).map((slug) => ({ slug, updatedAt: null as Date | null }));
  const projectList =
    projectRows.length > 0
      ? projectRows
      : (await getProjectSlugs()).map((slug) => ({ slug, updatedAt: null as Date | null }));

  const serviceRoutes: MetadataRoute.Sitemap = serviceList
    .filter((service) => !noindex.has(`/services/${service.slug}`))
    .map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      ...(service.updatedAt ? { lastModified: service.updatedAt } : {}),
      changeFrequency: "monthly",
      priority: 0.9,
    }));

  const workRoutes: MetadataRoute.Sitemap = projectList
    .filter((project) => !noindex.has(`/work/${project.slug}`))
    .map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      ...(project.updatedAt ? { lastModified: project.updatedAt } : {}),
      changeFrequency: "yearly",
      priority: 0.7,
    }));

  const postRoutes: MetadataRoute.Sitemap = await prisma.post
    .findMany({ where: { published: true }, select: { slug: true, date: true, updated: true, updatedAt: true } })
    .then((rows) =>
      rows
        .filter((p) => !noindex.has(`/blog/${p.slug}`))
        .map((p) => ({
          url: `${SITE_URL}/blog/${p.slug}`,
          lastModified:
            p.updated && p.updated !== ""
              ? new Date(p.updated)
              : p.updatedAt instanceof Date
                ? p.updatedAt
                : new Date(p.date),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
    )
    .catch(() =>
      POSTS.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        ...(POST_UPDATED[p.slug] ? { lastModified: new Date(POST_UPDATED[p.slug]) } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );

  return [...staticRoutes, ...serviceRoutes, ...workRoutes, ...postRoutes];
}