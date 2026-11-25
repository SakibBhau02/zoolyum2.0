import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, EmptyState, PageHeader } from "../_ui/primitives";
import { LeadActions } from "./leads-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

const KINDS = [
  { key: "", label: "All" },
  { key: "contact", label: "Contact" },
  { key: "careers", label: "Applicants" },
  { key: "newsletter", label: "Newsletter" },
  { key: "resource", label: "Resources" },
  { key: "audit", label: "Audit" },
] as const;

const PAGE_SIZE = 30;

function positionOf(payload: unknown): string {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const v = (payload as Record<string, unknown>).position;
    return typeof v === "string" ? v : "";
  }
  return "";
}

type LeadAttribution = {
  landing_page?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  utm?: Record<string, string>;
};

function attributionOf(payload: unknown): LeadAttribution | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const a = (payload as Record<string, unknown>).__attribution;
  return a && typeof a === "object" && !Array.isArray(a) ? (a as LeadAttribution) : null;
}

type PrivateAttachment = { field: string; key: string; name: string };

/** Private attachments saved through `lib/storage-private` (CVs). */
function attachmentsOf(payload: unknown): PrivateAttachment[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const list = (payload as Record<string, unknown>).__attachments;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.key !== "string" || typeof row.name !== "string") return [];
    return [{ field: typeof row.field === "string" ? row.field : "file", key: row.key, name: row.name }];
  });
}

/** Legacy career leads stored the public URL directly in the payload. */
function legacyAttachmentOf(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = (payload as Record<string, unknown>).resume;
  return typeof value === "string" && /^https?:\/\//i.test(value) ? value : null;
}

/**
 * Human label for where a lead came from. First-touch UTM wins, then a click
 * ID, then the referring host, and finally direct.
 */
function sourceLabel(a: LeadAttribution | null): { label: string; paid: boolean } {
  if (!a) return { label: "direct", paid: false };
  const utm = a.utm ?? {};
  if (utm.source) {
    return {
      label: [utm.source, utm.medium].filter(Boolean).join(" / "),
      paid: /cpc|paid|ppc|ads/i.test(utm.medium ?? ""),
    };
  }
  if (a.gclid) return { label: "google / cpc", paid: true };
  if (a.fbclid) return { label: "meta / paid", paid: true };
  if (a.msclkid) return { label: "bing / cpc", paid: true };
  if (a.referrer) {
    try {
      return { label: `ref: ${new URL(a.referrer).hostname.replace(/^www\./, "")}`, paid: false };
    } catch {
      return { label: "referral", paid: false };
    }
  }
  return { label: "direct", paid: false };
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; job?: string; q?: string; page?: string }>;
}) {
  await requireUser("viewer");
  const { kind = "", job = "", q = "", page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);

  const where: any = {};
  if (kind) where.kind = kind;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (job) where.payload = { path: ["position"], equals: job };

  const [rows, total, groups, unread, jobRows] = await Promise.all([
    prisma.lead
      .findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: { id: true, kind: true, name: true, email: true, payload: true, read: true, createdAt: true },
      })
      .catch(() => []),
    prisma.lead.count({ where }).catch(() => 0),
    prisma.lead
      .groupBy({ by: ["kind"], _count: { _all: true } })
      .catch(() => [] as { kind: string; _count: { _all: number } }[]) as Promise<
      { kind: string; _count: { _all: number } }[]
    >,
    prisma.lead.count({ where: { read: false } }).catch(() => 0),
    prisma.lead
      .findMany({ where: { kind: "careers" }, select: { payload: true }, take: 500 })
      .catch(() => []),
  ]);

  const counts = new Map(groups.map((g) => [g.kind, g._count._all]));
  const totalAll = groups.reduce<number>((n, g) => n + g._count._all, 0);
  const jobs = [...new Set(jobRows.map((l) => positionOf(l.payload)).filter(Boolean))].sort();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (patch: Record<string, string>) => {
    const p = new URLSearchParams();
    if (kind) p.set("kind", kind);
    if (job) p.set("job", job);
    if (q) p.set("q", q);
    if (page > 1) p.set("page", String(page));
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return `/admin/leads${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title={
          <>
            Leads<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Every contact, applicant and newsletter signup in one place. Filters run on the server."
        actions={<Badge tone={unread === 0 ? "ok" : "accent"}>{unread === 0 ? "Inbox clear" : `${unread} unread`}</Badge>}
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {KINDS.map((filter) => {
          const active = kind === filter.key;
          const count = filter.key ? counts.get(filter.key) ?? 0 : totalAll;
          return (
            <Link
              key={filter.key || "all"}
              href={href({ kind: filter.key, job: "", page: "" })}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                active
                  ? "border-[rgba(255,106,38,0.55)] bg-[var(--a-accent-soft)] text-[var(--a-accent)]"
                  : "border-[var(--a-line-strong)] text-[var(--a-muted)] hover:text-[var(--a-text)]"
              }`}
            >
              {filter.label} · {count}
            </Link>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form method="get" role="search" className="flex min-w-[240px] flex-1 gap-2">
          {kind && <input type="hidden" name="kind" value={kind} />}
          {job && <input type="hidden" name="job" value={job} />}
          <div className="relative flex-1">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name or email..."
              aria-label="Search leads"
              className="a-input !pl-9"
            />
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--a-faint)]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </div>
          <button type="submit" className="a-btn">
            Search
          </button>
          {(q || kind || job) && (
            <Link href="/admin/leads" className="a-btn a-btn-ghost">
              Reset
            </Link>
          )}
        </form>

        {kind === "careers" && jobs.length > 0 && (
          <form method="get" className="flex gap-2">
            <input type="hidden" name="kind" value="careers" />
            {q && <input type="hidden" name="q" value={q} />}
            <select name="job" defaultValue={job} aria-label="Filter by position" className="a-select !w-auto">
              <option value="">All positions</option>
              {jobs.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <button type="submit" className="a-btn">
              Filter
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2">
        {rows.length === 0 && (
          <EmptyState
            title="No leads match"
            description="Try clearing the filters, or wait for the next submission."
            action={
              <Link href="/admin/leads" className="a-btn">
                Clear filters
              </Link>
            }
          />
        )}

        {rows.map((lead) => {
          const position = positionOf(lead.payload);
          const attribution = attributionOf(lead.payload);
          const attachments = attachmentsOf(lead.payload);
          const legacyAttachment = legacyAttachmentOf(lead.payload);
          const source = sourceLabel(attribution);
          return (
            <article
              key={lead.id}
              className={`a-card p-4 ${lead.read ? "" : "border-[rgba(255,106,38,0.35)]"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
                    {lead.name || lead.email}
                    <span className="a-badge">{lead.kind}</span>
                    {position && <span className="a-badge a-badge-accent">{position}</span>}
                    <span className={`a-badge ${source.paid ? "a-badge-accent" : ""}`} title={attribution?.landing_page ?? undefined}>
                      {source.label}
                    </span>
                    {!lead.read && <span className="a-badge a-badge-warn">unread</span>}
                  </p>
                  <p className="a-faint mt-1 text-[11px]">
                    {lead.email} ·{" "}
                    {lead.createdAt.toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {(attribution?.utm?.campaign || attribution?.landing_page) && (
                    <p className="a-faint mt-0.5 text-[10.5px]">
                      {attribution.utm?.campaign ? `campaign: ${attribution.utm.campaign}` : ""}
                      {attribution.utm?.campaign && attribution.landing_page ? " · " : ""}
                      {attribution.landing_page ? `landed on ${attribution.landing_page}` : ""}
                    </p>
                  )}
                </div>
                <LeadActions id={lead.id} read={lead.read} />
              </div>

              {(attachments.length > 0 || legacyAttachment) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <a
                      key={file.key}
                      href={`/admin/attachment?key=${encodeURIComponent(file.key)}`}
                      className="a-btn a-btn-sm"
                      download
                    >
                      Download {file.name}
                    </a>
                  ))}
                  {legacyAttachment && (
                    <a
                      href={legacyAttachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="a-btn a-btn-sm"
                    >
                      Open resume (legacy public URL)
                    </a>
                  )}
                </div>
              )}

              {lead.payload && typeof lead.payload === "object" && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-[11.5px] text-[var(--a-accent)]">Details</summary>
                  <pre className="a-scroll mt-2 max-h-64 overflow-auto rounded-[8px] border border-[var(--a-line)] bg-[#171310] p-3 text-[11px] leading-relaxed">
                    {JSON.stringify(lead.payload, null, 2)}
                  </pre>
                </details>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
        <span className="a-faint">
          {total === 0 ? "No leads" : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
        </span>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link href={href({ page: String(page - 1) })} className="a-btn a-btn-sm">
                Previous
              </Link>
            )}
            <span className="a-faint px-1">
              {page} / {pages}
            </span>
            {page < pages && (
              <Link href={href({ page: String(page + 1) })} className="a-btn a-btn-sm">
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
