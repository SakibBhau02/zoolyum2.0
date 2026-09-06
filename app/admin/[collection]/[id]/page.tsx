import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS, type CollectionKey, type FieldDef } from "../../config";
import { EditorForm } from "../../ui";
import { PostEditor } from "../../ui-post";
import { ProjectEditor } from "../../ui-project";
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
  if (!(collection in COLLECTIONS)) notFound();
  const key = collection as CollectionKey;
  const def = COLLECTIONS[key];

  const initial: Record<string, string> = {};
  let slugVal = "";
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
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 font-body text-xs text-ivory/40">
          <Link href="/admin" className="transition-colors hover:text-sienna-bright">Admin</Link>
          <span aria-hidden="true">/</span>
          <Link href="/admin/projects" className="transition-colors hover:text-sienna-bright">Work / Case Studies</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ivory/70">{id === "new" ? "New" : "Edit"}</span>
        </nav>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">
          Work / {id === "new" ? "New" : "Edit"}
        </p>
        <h1 className="mb-8 mt-3 font-display text-3xl font-semibold text-ivory">
          {id === "new" ? "New Case" : "Edit Case"}<span className="text-sienna">.</span>
        </h1>
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
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 font-body text-xs text-ivory/40">
          <Link href="/admin" className="transition-colors hover:text-sienna-bright">Admin</Link>
          <span aria-hidden="true">/</span>
          <Link href="/admin/posts" className="transition-colors hover:text-sienna-bright">Blog Posts</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ivory/70">{id === "new" ? "New" : "Edit"}</span>
        </nav>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">
          Blog Posts / {id === "new" ? "New" : "Edit"}
        </p>
        <h1 className="mb-8 mt-3 font-display text-3xl font-semibold text-ivory">
          {id === "new" ? "New Post" : "Edit Post"}<span className="text-sienna">.</span>
        </h1>
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
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 font-body text-xs text-ivory/40">
        <Link href="/admin" className="transition-colors hover:text-sienna-bright">Admin</Link>
        <span aria-hidden="true">/</span>
        <a href={`/admin/${collection}`} className="transition-colors hover:text-sienna-bright">{def.label}</a>
        <span aria-hidden="true">/</span>
        <span className="text-ivory/70">{id === "new" ? "New" : "Edit"}</span>
      </nav>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">
        {def.label} / {id === "new" ? "New" : "Edit"}
      </p>
      <h1 className="mb-8 mt-3 font-display text-3xl font-semibold text-ivory">
        {id === "new" ? `New ${def.singular}` : `Edit ${def.singular}`}<span className="text-sienna">.</span>
      </h1>
      <div className="card-surface p-6 md:p-8">
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