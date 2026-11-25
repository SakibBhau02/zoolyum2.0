import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/auth";
import { COLLECTIONS, type CollectionKey } from "../config";
import { Badge, PageHeader } from "../_ui/primitives";
import { Icon } from "../_ui/icons";
import { CollectionTable, type Row } from "./list-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

const PAGE_SIZE = 25;

const VIEW_BASE: Partial<Record<CollectionKey, string>> = {
  posts: "/blog",
  projects: "/work",
  services: "/services",
};

const SEARCH_FIELDS: Record<CollectionKey, string[]> = {
  posts: ["title", "slug", "category"],
  projects: ["client", "industry", "title"],
  services: ["name", "slug", "tagline"],
  team: ["name", "role", "expertise"],
  jobs: ["title", "dept", "location"],
  testimonials: ["company", "author", "industry"],
  menulinks: ["label", "href", "group"],
};

const ORDER: Record<CollectionKey, any> = {
  posts: { date: "desc" },
  projects: [{ sort: "asc" }, { updatedAt: "desc" }],
  services: { name: "asc" },
  team: { sort: "asc" },
  jobs: { title: "asc" },
  testimonials: { sort: "asc" },
  menulinks: [{ sort: "asc" }, { label: "asc" }],
};

function dbFor(key: CollectionKey): any {
  return {
    posts: prisma.post,
    projects: prisma.project,
    services: prisma.service,
    team: prisma.teamMember,
    jobs: prisma.job,
    testimonials: prisma.testimonial,
    menulinks: prisma.menuLink,
  }[key];
}

export default async function CollectionListPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const user = await requireUser("viewer");
  const { collection } = await params;
  const sp = await searchParams;
  if (!(collection in COLLECTIONS)) notFound();
  const key = collection as CollectionKey;
  const def = COLLECTIONS[key];
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const supportsStatus = key === "posts" || key === "projects";

  const and: any[] = [];
  if (q) and.push({ OR: SEARCH_FIELDS[key].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) });
  if (supportsStatus && status) and.push({ status });
  if (key === "jobs" && status) and.push({ active: status === "published" });
  if (key === "menulinks" && status) and.push({ visible: status === "published" });
  const where = and.length ? { AND: and } : {};

  const db = dbFor(key);
  const [rows, total] = await Promise.all([
    db.findMany({ where, orderBy: ORDER[key], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }).catch(() => []),
    db.count({ where }).catch(() => 0),
  ]);

  let applicantCounts: Record<string, number> = {};
  if (key === "jobs") {
    try {
      const leads = await prisma.lead.findMany({ where: { kind: "careers" }, select: { payload: true } });
      for (const lead of leads) {
        const payload = lead.payload;
        const pos =
          payload && typeof payload === "object" && !Array.isArray(payload)
            ? String((payload as Record<string, unknown>).position ?? "")
            : "";
        if (pos) applicantCounts[pos] = (applicantCounts[pos] ?? 0) + 1;
      }
    } catch {
      applicantCounts = {};
    }
  }

  const mapped: Row[] = (rows as Record<string, any>[]).map((r) => {
    const slug = String(r[def.slugField] ?? "");
    const title = String(r[def.columns[0]] ?? slug ?? `#${r.id}`);
    const subtitle = def.columns
      .slice(1)
      .map((c) => (typeof r[c] === "string" ? r[c] : ""))
      .filter(Boolean)
      .join(" · ");
    const statusValue =
      key === "posts" || key === "projects"
        ? String(r.status ?? (r.published ? "published" : "draft"))
        : key === "jobs"
          ? r.active
            ? "active"
            : "inactive"
          : key === "menulinks"
            ? r.visible
              ? "visible"
              : "hidden"
            : null;

    return {
      id: r.id as number,
      title,
      subtitle: subtitle || slug,
      status: statusValue,
      thumb:
        key === "posts" && typeof r.cover === "string" && r.cover
          ? { kind: "image", value: r.cover }
          : key === "projects" && typeof r.gradient === "string"
            ? { kind: "gradient", value: r.gradient }
            : null,
      extra:
        key === "jobs"
          ? {
              label: `${applicantCounts[String(r.title ?? "")] ?? 0} applicant${(applicantCounts[String(r.title ?? "")] ?? 0) === 1 ? "" : "s"}`,
              href: `/admin/leads?kind=careers&job=${encodeURIComponent(String(r.title ?? ""))}`,
            }
          : null,
      viewHref: VIEW_BASE[key] && slug ? `${VIEW_BASE[key]}/${slug}` : null,
    };
  });

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (patch: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (page > 1) p.set("page", String(page));
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return `/admin/${key}${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow={`Content · ${total} item${total === 1 ? "" : "s"}`}
        title={
          <>
            {def.label}
            <span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description={`Create, edit and publish ${def.label.toLowerCase()}. Search runs on the server across ${SEARCH_FIELDS[key].join(", ")}.`}
        actions={
          <Link href={`/admin/${key}/new`} className="a-btn a-btn-primary">
            <Icon name="plus" className="h-3.5 w-3.5" /> New {def.singular.toLowerCase()}
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form method="get" role="search" className="flex min-w-[240px] flex-1 gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={`Search ${def.label.toLowerCase()}...`}
              aria-label={`Search ${def.label}`}
              className="a-input !pl-9"
            />
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--a-faint)]" />
          </div>
          <button type="submit" className="a-btn">
            Search
          </button>
          {(q || status) && (
            <Link href={`/admin/${key}`} className="a-btn a-btn-ghost">
              Reset
            </Link>
          )}
        </form>

        {(supportsStatus || key === "jobs" || key === "menulinks") && (
          <div className="flex flex-wrap gap-1.5">
            {(supportsStatus
              ? [
                  { key: "", label: "All" },
                  { key: "published", label: "Published" },
                  { key: "review", label: "In review" },
                  { key: "draft", label: "Drafts" },
                ]
              : [
                  { key: "", label: "All" },
                  { key: "published", label: key === "jobs" ? "Live" : "Visible" },
                  { key: "draft", label: key === "jobs" ? "Hidden" : "Hidden" },
                ]
            ).map((f) => {
              const active = status === f.key;
              return (
                <Link
                  key={f.key || "all"}
                  href={href({ status: f.key, page: "" })}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                    active
                      ? "border-[rgba(255,106,38,0.55)] bg-[var(--a-accent-soft)] text-[var(--a-accent)]"
                      : "border-[var(--a-line-strong)] text-[var(--a-muted)] hover:text-[var(--a-text)]"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CollectionTable
        collection={key}
        rows={mapped}
        supportsStatus={supportsStatus}
        canDelete={can(user.role, "admin")}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
        <span className="a-faint">
          {total === 0 ? "No items" : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
          {q && ` for “${q}”`}
        </span>
        {pages > 1 && (
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href({ page: String(page - 1) })} className="a-btn a-btn-sm">
                Previous
              </Link>
            )}
            <span className="a-faint self-center px-1">
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

      <p className="a-faint mt-4 flex flex-wrap items-center gap-2 text-[10.5px]">
        <Badge tone="neutral">{def.singular}</Badge>
        <span>
          Public URL is built from <span className="a-mono">{def.slugField}</span>. Changes to it need a redirect.
        </span>
        <Link href="/admin/seo/redirects" className="underline underline-offset-2 hover:text-[var(--a-accent)]">
          Manage redirects
        </Link>
      </p>
    </div>
  );
}
