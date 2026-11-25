import { getSetting } from "@/lib/content";
import { breadcrumbLd, graph, jsonLdHtml, webPageLd } from "@/lib/seo";

/**
 * Server-rendered JSON-LD for a static route: a WebPage node plus the
 * BreadcrumbList that replaces a raw URL in search results with a readable
 * path. Detail pages (blog, work, services) emit their own richer graphs.
 *
 * Reads the same `seo.{route}.*` settings as pageMeta so the structured data
 * never drifts from the title and description actually published.
 */
export async function PageSchema({
  route,
  path,
  label,
  description,
  type = "WebPage",
  trail,
  extra,
}: {
  route: string;
  path: string;
  label: string;
  description?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
  trail?: { name: string; path: string }[];
  /** Additional schema.org nodes for the same @graph. */
  extra?: Record<string, unknown>[];
}) {
  const [title, desc] = await Promise.all([
    getSetting(`seo.${route}.title`, label),
    getSetting(`seo.${route}.description`, description ?? label),
  ]);
  const crumbs = trail ?? [
    { name: "Home", path: "/" },
    { name: label, path },
  ];
  const nodes = [
    webPageLd({ path, name: title, description: desc, type }),
    breadcrumbLd(crumbs),
    ...(extra ?? []),
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(graph(nodes)) }}
    />
  );
}
