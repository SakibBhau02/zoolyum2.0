import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS, type CollectionKey } from "../config";
import { DeleteButton } from "../ui";

async function fetchRows(key: CollectionKey): Promise<Record<string, unknown>[]> {
  switch (key) {
    case "posts":
      return (await prisma.post.findMany({ select: { id: true, slug: true, title: true, category: true, date: true } })) as unknown as Record<string, unknown>[];
    case "projects":
      return (await prisma.project.findMany({ select: { id: true, slug: true, client: true, industry: true, result: true } })) as unknown as Record<string, unknown>[];
    case "services":
      return (await prisma.service.findMany({ select: { id: true, slug: true, name: true, tagline: true } })) as unknown as Record<string, unknown>[];
    case "team":
      return (await prisma.teamMember.findMany({ orderBy: { sort: "asc" } })) as unknown as Record<string, unknown>[];
    case "jobs":
      return (await prisma.job.findMany()) as unknown as Record<string, unknown>[];
    case "testimonials":
      return (await prisma.testimonial.findMany({ orderBy: { sort: "asc" } })) as unknown as Record<string, unknown>[];
  }
}

export default async function CollectionListPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  if (!(collection in COLLECTIONS)) notFound();
  const key = collection as CollectionKey;
  const def = COLLECTIONS[key];
  const rows = await fetchRows(key);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Content</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ivory">{def.label}<span className="text-sienna">.</span></h1>
        </div>
        <Link href={`/admin/${key}/new`} className="btn btn-primary !px-5 !py-2.5 !text-sm">
          + New {def.singular}
        </Link>
      </div>
      <div className="mt-8 space-y-3">
        {rows.length === 0 && (
          <p className="font-body text-sm text-ivory/45">Nothing here yet.</p>
        )}
        {rows.map((r) => (
          <div key={r.id as number} className="card-surface flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-ivory">
                {String(r[def.columns[0]] ?? r[def.slugField] ?? `#${r.id as number}`)}
              </p>
              <p className="mt-1 truncate font-body text-xs text-ivory/45">
                {def.columns.slice(1).map((c) => String(r[c] ?? "")).filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/${key}/${r.id as number}`} className="rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/75 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
                Edit
              </Link>
              <DeleteButton collection={key} id={r.id as number} what={String(r[def.columns[0]] ?? "")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}