import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/data";
import { Breadcrumbs, EmptyState, PageHeader } from "../../_ui/primitives";
import { SeoEditor } from "./seo-editor";

export default async function SeoEditPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  await requireUser("editor");
  const { path } = await searchParams;
  if (!path) {
    return (
      <div>
        <PageHeader eyebrow="Grow" title="SEO editor" description="Pick a route from the SEO workspace." />
        <EmptyState title="No page selected" action={<Link href="/admin/seo" className="a-btn">Back to SEO</Link>} />
      </div>
    );
  }

  const normalised = path.startsWith("/") ? path : `/${path}`;
  const page = normalised === "/" ? "home" : normalised.replace(/^\//, "");
  const [row, settings] = await Promise.all([
    prisma.seoMeta.findUnique({ where: { path: normalised } }).catch(() => null),
    prisma.siteSetting
      .findMany({ where: { key: { in: [`seo.${page}.title`, `seo.${page}.description`] } }, select: { key: true, value: true } })
      .catch(() => []),
  ]);
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));

  // Fall back to the same values the public page generates, so the editor
  // previews reality instead of an empty box.
  let contentTitle = "";
  let contentDescription = "";
  const segment = normalised.split("/").filter(Boolean);
  if (segment[0] === "services" && segment[1]) {
    const service = await prisma.service.findUnique({ where: { slug: segment[1] } }).catch(() => null);
    if (service) {
      contentTitle = `${service.name} - ${service.tagline}`;
      contentDescription = service.oneParagraph;
    }
  } else if (segment[0] === "work" && segment[1]) {
    const project = await prisma.project.findUnique({ where: { slug: segment[1] } }).catch(() => null);
    if (project) {
      contentTitle = `${project.client}: ${project.result}`;
      contentDescription = `${project.title}. ${project.challenge} Outcome: ${project.result}.`;
    }
  } else if (segment[0] === "blog" && segment[1]) {
    const post = await prisma.post.findUnique({ where: { slug: segment[1] } }).catch(() => null);
    if (post) {
      contentTitle = post.title;
      contentDescription = post.excerpt;
    }
  }

  const defaults = {
    title: settingMap.get(`seo.${page}.title`) || contentTitle || "",
    description: settingMap.get(`seo.${page}.description`) || contentDescription || "",
    canonical: `${SITE_URL}${normalised === "/" ? "" : normalised}`,
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "SEO", href: "/admin/seo" }, { label: normalised }]} />
      <PageHeader
        eyebrow="Per-route metadata"
        title={
          <>
            {normalised === "/" ? "Home" : normalised}
            <span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Overrides here win over the page's built-in metadata. Empty fields fall back to the generated value."
        actions={
          <a href={normalised} target="_blank" rel="noreferrer" className="a-btn">
            View page
          </a>
        }
      />
      <SeoEditor
        siteHost={new URL(SITE_URL).host}
        defaults={defaults}
        initial={{
          path: normalised,
          title: row?.title ?? "",
          description: row?.description ?? "",
          ogImage: row?.ogImage ?? "",
          canonical: row?.canonical ?? "",
          noindex: row?.noindex ?? false,
          keywords: (row?.keywords ?? []).join("\n"),
          schemaType: row?.schemaType ?? "",
          schemaJson: row?.schemaJson ? JSON.stringify(row.schemaJson, null, 2) : "",
        }}
      />
    </div>
  );
}
