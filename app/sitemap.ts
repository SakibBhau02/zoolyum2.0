import type { MetadataRoute } from "next";
import { SERVICES, PROJECTS, POSTS, POST_UPDATED, SITE_URL } from "@/lib/data";
import { getProjectSlugs, getServiceSlugs } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

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
    lastModified: now,
    changeFrequency: r.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: r.priority,
  }));

  // DB-first slugs (static TS fallback inside the getters), so CMS-added
  // services / case studies appear in the sitemap without a redeploy.
  const [serviceSlugs, projectSlugs] = await Promise.all([getServiceSlugs(), getProjectSlugs()]);
  const serviceSlugList = serviceSlugs.length > 0 ? serviceSlugs : SERVICES.map((s) => s.slug);
  const projectSlugList = projectSlugs.length > 0 ? projectSlugs : PROJECTS.map((p) => p.slug);

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugList.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const workRoutes: MetadataRoute.Sitemap = projectSlugList.map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = await prisma.post
    .findMany({ where: { published: true }, select: { slug: true, date: true, updated: true } })
    .then((rows) =>
      rows.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updated && p.updated !== "" ? new Date(p.updated) : new Date(p.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    )
    .catch(() =>
      POSTS.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: POST_UPDATED[p.slug] ? new Date(POST_UPDATED[p.slug]) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );

  return [...staticRoutes, ...serviceRoutes, ...workRoutes, ...postRoutes];
}