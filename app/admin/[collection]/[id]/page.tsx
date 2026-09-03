import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS, type CollectionKey, type FieldDef } from "../../config";
import { EditorForm } from "../../ui";

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
      testimonials: prisma.testimonial,
    };
    const row = (await delegates[key].findUnique({ where: { id: Number(id) } })) as Record<string, unknown> | null;
    if (!row) notFound();
    for (const f of def.fields) initial[f.name] = serialize(f, row[f.name]);
    slugVal = String(row[def.slugField] ?? "");
  } else {
    for (const f of def.fields) initial[f.name] = f.kind === "checkbox" ? "false" : "";
  }

  const base = VIEW_BASE[key];
  return (
    <div>
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