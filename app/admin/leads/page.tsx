import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadRowButtons } from "../ui";

const KINDS = [
  { key: "", label: "All" },
  { key: "contact", label: "Contact" },
  { key: "careers", label: "Applicants" },
  { key: "newsletter", label: "Newsletter" },
  { key: "resource", label: "Resources" },
] as const;

type LeadRow = {
  id: number; kind: string; name: string | null; email: string;
  payload: unknown; read: boolean; createdAt: Date;
};

function payloadPosition(p: unknown): string {
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const v = (p as Record<string, unknown>).position;
    return typeof v === "string" ? v : "";
  }
  return "";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; job?: string; q?: string }>;
}) {
  const { kind = "", job = "", q = "" } = await searchParams;
  const leads = (await prisma.lead.findMany({ orderBy: { createdAt: "desc" } }).catch(() => [])) as LeadRow[];
  const counts: Record<string, number> = {};
  for (const l of leads) counts[l.kind] = (counts[l.kind] ?? 0) + 1;
  const jobs = [...new Set(leads.filter((l) => l.kind === "careers").map((l) => payloadPosition(l.payload)).filter(Boolean))].sort();
  const query = q.trim().toLowerCase();
  const rows = leads.filter((l) => {
    if (kind && l.kind !== kind) return false;
    if (job && payloadPosition(l.payload) !== job) return false;
    if (query && !(l.name ?? "").toLowerCase().includes(query) && !l.email.toLowerCase().includes(query)) return false;
    return true;
  });
  const unread = leads.filter((l) => !l.read).length;
  const link = (k: string, j: string) => {
    const p = new URLSearchParams();
    if (k) p.set("kind", k);
    if (j) p.set("job", j);
    const s = p.toString();
    return `/admin/leads${s ? `?${s}` : ""}`;
  };
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Studio</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ivory md:text-4xl">
        Leads inbox{unread > 0 ? ` (${unread} unread)` : ""}<span className="text-sienna">.</span>
      </h1>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {KINDS.map((k) => {
          const active = kind === k.key;
          const n = k.key ? (counts[k.key] ?? 0) : leads.length;
          return (
            <Link
              key={k.key || "all"}
              href={link(k.key, "")}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-4 py-2 font-body text-xs font-semibold transition-colors ${active ? "border-sienna-bright/70 bg-sienna/15 text-sienna-bright" : "border-olive/30 text-ivory/60 hover:border-olive/60 hover:text-ivory"}`}
            >
              {k.label} · {n}
            </Link>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form method="get" className="flex gap-2" role="search">
          {kind && <input type="hidden" name="kind" value={kind} />}
          {job && <input type="hidden" name="job" value={job} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name or email..."
            aria-label="Search leads"
            className="w-full max-w-xs rounded-xl border border-olive/35 bg-umber/60 px-4 py-2.5 font-body text-sm text-ivory placeholder:text-ivory/30 focus:border-sienna-bright/70 focus:outline-none"
          />
          <button type="submit" className="rounded-xl border border-olive/35 px-4 py-2.5 font-body text-sm font-semibold text-ivory/70 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
            Search
          </button>
        </form>
        {kind === "careers" && jobs.length > 0 && (
          <form method="get" className="flex gap-2">
            <input type="hidden" name="kind" value="careers" />
            <select
              name="job"
              defaultValue={job}
              aria-label="Filter by position"
              className="rounded-xl border border-olive/35 bg-umber/60 px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none"
            >
              <option value="">All positions</option>
              {jobs.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <button type="submit" className="rounded-xl border border-olive/35 px-4 py-2.5 font-body text-sm font-semibold text-ivory/70 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
              Filter
            </button>
          </form>
        )}
      </div>
      <div className="mt-5 space-y-3">
        {rows.length === 0 && (
          <div className="card-surface p-8 text-center">
            <p className="font-body text-sm text-ivory/45">No leads match these filters.</p>
            <Link href="/admin/leads" className="mt-3 inline-block font-body text-sm font-semibold text-sienna-bright hover:underline">Clear filters →</Link>
          </div>
        )}
        {rows.map((l) => (
          <div key={l.id} className={`card-surface p-5 ${l.read ? "opacity-70" : "border-sienna/40"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-ivory">
                  {l.name ?? l.email}
                  <span className="ml-2 rounded-full border border-olive/35 px-2 py-0.5 align-middle font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/50">
                    {l.kind}
                  </span>
                  {payloadPosition(l.payload) && (
                    <span className="ml-2 align-middle font-body text-xs text-sienna-bright">{payloadPosition(l.payload)}</span>
                  )}
                </p>
                <p className="mt-1 font-body text-xs text-ivory/45">
                  {l.email} · {new Date(l.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <LeadRowButtons id={l.id} read={l.read} />
            </div>
            {Boolean(l.payload) && typeof l.payload === "object" && (
              <details className="mt-3">
                <summary className="cursor-pointer font-body text-xs text-sienna-bright">Details</summary>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-espresso p-3 font-mono text-xs leading-relaxed text-ivory/70">
                  {JSON.stringify(l.payload, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
