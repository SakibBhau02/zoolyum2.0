import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS, type CollectionKey } from "../config";
import { DeleteButton, DuplicateButton } from "../ui";

async function fetchRows(key: CollectionKey): Promise<Record<string, unknown>[]> {
  switch (key) {
    case "posts":
      return (await prisma.post.findMany({ orderBy: { date: "desc" } })) as unknown as Record<string, unknown>[];
    case "projects":
      return (await prisma.project.findMany({ orderBy: { updatedAt: "desc" } })) as unknown as Record<string, unknown>[];
    case "services":
      return (await prisma.service.findMany()) as unknown as Record<string, unknown>[];
    case "team":
      return (await prisma.teamMember.findMany({ orderBy: { sort: "asc" } })) as unknown as Record<string, unknown>[];
    case "jobs":
      return (await prisma.job.findMany()) as unknown as Record<string, unknown>[];
    case "testimonials":
      return (await prisma.testimonial.findMany({ orderBy: { sort: "asc" } })) as unknown as Record<string, unknown>[];
    case "menulinks":
      return (await prisma.menuLink.findMany({ orderBy: { sort: "asc" } })) as unknown as Record<string, unknown>[];
  }
}

export default async function CollectionListPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { collection } = await params;
  const { q } = await searchParams;
  if (!(collection in COLLECTIONS)) notFound();
  const key = collection as CollectionKey;
  const def = COLLECTIONS[key];
  const query = (q ?? "").trim().toLowerCase();
  const all = await fetchRows(key).catch(() => [] as Record<string, unknown>[]);
  let applicantCounts: Record<string, number> = {};
  if (key === "jobs") {
    try {
      const appLeads = await prisma.lead.findMany({ where: { kind: "careers" }, select: { payload: true } });
      for (const l of appLeads) {
        const pos = l.payload && typeof l.payload === "object" && !Array.isArray(l.payload) ? String((l.payload as Record<string, unknown>).position ?? "") : "";
        if (pos) applicantCounts[pos] = (applicantCounts[pos] ?? 0) + 1;
      }
    } catch { applicantCounts = {}; }
  }
  const rows = query
    ? all.filter((r) =>
        [def.slugField, ...def.columns].some((c) => String(r[c] ?? "").toLowerCase().includes(query)),
      )
    : all;
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 font-body text-xs text-ivory/40">
        <Link href="/admin" className="transition-colors hover:text-sienna-bright">Admin</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ivory/70">{def.label}</span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Content · {rows.length} of {all.length}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ivory md:text-4xl">{def.label}<span className="text-sienna">.</span></h1>
        </div>
        <Link href={`/admin/${key}/new`} className="btn btn-primary !px-5 !py-2.5 !text-sm">
          + New {def.singular}
        </Link>
      </div>
      <form method="get" className="mt-6 flex gap-2" role="search">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={`Search ${def.label.toLowerCase()}...`}
          aria-label={`Search ${def.label}`}
          className="w-full max-w-sm rounded-xl border border-olive/35 bg-umber/60 px-4 py-2.5 font-body text-sm text-ivory placeholder:text-ivory/30 focus:border-sienna-bright/70 focus:outline-none"
        />
        <button type="submit" className="rounded-xl border border-olive/35 px-4 py-2.5 font-body text-sm font-semibold text-ivory/70 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
          Search
        </button>
      </form>
      <div className="mt-5 space-y-3">
        {rows.length === 0 && (
          <div className="card-surface p-8 text-center">
            <p className="font-body text-sm text-ivory/45">{query ? `No results for "${query}".` : "Nothing here yet."}</p>
            {!query && (
              <Link href={`/admin/${key}/new`} className="mt-4 inline-block font-body text-sm font-semibold text-sienna-bright hover:underline">
                Create the first {def.singular.toLowerCase()} →
              </Link>
            )}
          </div>
        )}
        {rows.map((r) => {
          const id = r.id as number;
          const pub = (r as { published?: unknown }).published;
          return (
            <div key={id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:border-olive/40">
              <div className="flex min-w-0 items-center gap-3.5">
                {key === "posts" && typeof r.cover === "string" && r.cover !== "" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.cover} alt="" aria-hidden="true" className="h-11 w-11 shrink-0 rounded-lg border border-olive/25 object-cover" loading="lazy" />
                )}
                {key === "projects" && typeof r.gradient === "string" && (
                  <span aria-hidden="true" className={`h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br ${r.gradient}`} />
                )}
                {"published" in r && (
                  <span title={pub ? "Published" : "Draft"} aria-label={pub ? "Published" : "Draft"} className={`h-2.5 w-2.5 shrink-0 rounded-full ${pub ? "bg-emerald-400" : "bg-amber-400"}`} />
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-ivory">
                    {String(r[def.columns[0]] ?? r[def.slugField] ?? `#${id}`)}
                  </p>
                  {key === "jobs" && (
                    <a href={`/admin/leads?kind=careers&job=${encodeURIComponent(String(r.title ?? ""))}`} className="mt-1 block font-body text-xs font-semibold text-sienna-bright hover:underline">
                      {applicantCounts[String(r.title ?? "")] ?? 0} applicant{(applicantCounts[String(r.title ?? "")] ?? 0) === 1 ? "" : "s"} →
                    </a>
                  )}
                  <p className="mt-1 truncate font-body text-xs text-ivory/45">
                    {def.columns.slice(1).map((c) => String(r[c] ?? "")).filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/${key}/${id}`} className="rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/75 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
                  Edit
                </Link>
                <DuplicateButton collection={key} id={id} />
                <DeleteButton collection={key} id={id} what={String(r[def.columns[0]] ?? "")} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
