import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { COLLECTIONS, type CollectionKey, type FieldDef } from "../../config";
import { EditorForm } from "../../ui";
import { PostEditor } from "../../ui-post";
import { ProjectEditor } from "../../ui-project";
import { StatusControl } from "../../_ui/status-control";
import { Breadcrumbs, PageHeader } from "../../_ui/primitives";
import { SITE_URL } from "@/lib/data";

const VIEW_BASE: Partial<Record<CollectionKey, string>> = {
  posts: "/blog",
  projects: "/work",
  services: "/services",
};

function serialize(f: FieldDef, value: unknown): string {
  if (value === null || value === undefined) {
    if (f.kind === "checkbox") return "false";
    if (f.kind === "number") return "";
    return "";
  }
  if (f.kind === "checkbox") return value ? "true" : "false";
  if (f.kind === "number") return String(value);
  if (f.kind === "list") {
    const sep = f.sep === "DOUBLE_NEWLINE" ? "\n\n" : "\n";
    return Array.isArray(value) ? (value as unknown[]).map(String).join(sep) : "";
  }
  if (f.kind === "json") return JSON.stringify(value, null, 2);
  return String(value);
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection, id } = await params;
  await requireUser("editor");
  if (!(collection in COLLECTIONS)) notFound();
  const key = collection as CollectionKey;
  const def = COLLECTIONS[key];

  const initial: Record<string, string> = {};
  let slugVal = "";
  let statusVal = "draft";
  if (id !== "new") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegates: Record<CollectionKey, any> = {
      posts: prisma.post,
      projects: prisma.project,
      services: prisma.service,
      team: prisma.teamMember,
      jobs: prisma.job,
      menulinks: prisma.menuLink,
      testimonials: prisma.testimonial,
    };
    const row = (await delegates[key].findUnique({ where: { id: Number(id) } })) as Record<string, unknown> | null;
    if (!row) notFound();
    for (const f of def.fields) initial[f.name] = serialize(f, row[f.name]);
    slugVal = String(row[def.slugField] ?? "");
    statusVal = String(row.status ?? (row.published ? "published" : "draft"));
  } else {
    for (const f of def.fields)
      initial[f.name] = f.kind === "checkbox" ? (f.name === "published" || f.name === "active" ? "true" : "false") : "";
  }

  const base = VIEW_BASE[key];
  if (key === "projects") {
    const industries: string[] = await prisma.project
      .findMany({ select: { industry: true } })
      .then((r) => Array.from(new Set(r.map((x) => x.industry).filter(Boolean))))
      .catch(() => [] as string[]);
    const servicesList: string[] = await prisma.project
      .findMany({ select: { services: true } })
      .then((r) => Array.from(new Set(r.flatMap((x) => x.services))))
      .catch(() => [] as string[]);
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Work / Case Studies", href: "/admin/projects" },
            { label: id === "new" ? "New" : "Edit" },
          ]}
        />
        <PageHeader
          eyebrow={`Work / ${id === "new" ? "New" : "Edit"}`}
          title={
            <>
              {id === "new" ? "New Case" : "Edit Case"}
              <span className="text-[var(--a-accent)]">.</span>
            </>
          }
        />
        {id !== "new" && <StatusControl collection="projects" id={Number(id)} status={statusVal} />}
        {base && slugVal && (
          <Link href={`/admin/seo/edit?path=${encodeURIComponent(`${base}/${slugVal}`)}`} className="a-btn a-btn-sm">
            SEO for this page
          </Link>
        )}
        <ProjectEditor
          collection={key}
          id={id}
          initial={initial}
          isNew={id === "new"}
          industries={industries}
          servicesList={servicesList}
          viewHref={base && slugVal ? `${base}/${slugVal}` : undefined}
        />
      </div>
    );
  }
  if (key === "posts") {
    const cats: string[] = await prisma.post
      .findMany({ select: { category: true } })
      .then((r) => Array.from(new Set(r.map((x) => x.category).filter(Boolean))))
      .catch(() => [] as string[]);
    const team: { name: string; role: string }[] = await prisma.teamMember
      .findMany({ select: { name: true, role: true }, orderBy: { sort: "asc" } })
      .catch(() => [] as { name: string; role: string }[]);
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Blog Posts", href: "/admin/posts" },
            { label: id === "new" ? "New" : "Edit" },
          ]}
        />
        <PageHeader
          eyebrow={`Blog Posts / ${id === "new" ? "New" : "Edit"}`}
          title={
            <>
              {id === "new" ? "New Post" : "Edit Post"}
              <span className="text-[var(--a-accent)]">.</span>
            </>
          }
        />
        {id !== "new" && <StatusControl collection="posts" id={Number(id)} status={statusVal} />}
        {base && slugVal && (
          <Link href={`/admin/seo/edit?path=${encodeURIComponent(`${base}/${slugVal}`)}`} className="a-btn a-btn-sm">
            SEO for this page
          </Link>
        )}
        <div>
          <PostEditor
            collection={key}
            id={id}
            initial={initial}
            isNew={id === "new"}
            categories={cats}
            authors={team}
            siteUrl={SITE_URL}
            viewHref={base && slugVal ? `${base}/${slugVal}` : undefined}
          />
        </div>
      </div>
    );
  }
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: def.label, href: `/admin/${collection}` },
          { label: id === "new" ? "New" : "Edit" },
        ]}
      />
      <PageHeader
        eyebrow={`${def.label} / ${id === "new" ? "New" : "Edit"}`}
        title={
          <>
            {id === "new" ? `New ${def.singular}` : `Edit ${def.singular}`}
            <span className="text-[var(--a-accent)]">.</span>
          </>
        }
      />
      {base && slugVal && (
        <div className="mb-4">
          <Link href={`/admin/seo/edit?path=${encodeURIComponent(`${base}/${slugVal}`)}`} className="a-btn a-btn-sm">
            SEO for this page
          </Link>
        </div>
      )}
      <div className="a-card p-5 md:p-7">
        <EditorForm
          collection={key}
          id={id}
          fields={def.fields}
          initial={initial}
          viewHref={base && slugVal ? `${base}/${slugVal}` : undefined}
        />
      </div>
    </div>
  );
}