import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader } from "../_ui/primitives";
import { shortDate } from "../_ui/format";

const FILTERS = [
  { key: "", label: "Everything" },
  { key: "posts", label: "Posts" },
  { key: "projects", label: "Case studies" },
  { key: "settings", label: "Settings" },
  { key: "user", label: "Accounts" },
  { key: "media", label: "Media" },
  { key: "auth", label: "Sign-ins" },
];

function toneFor(action: string): "ok" | "warn" | "bad" | "accent" | "neutral" {
  if (action.includes("delete") || action.includes("restore")) return "bad";
  if (action.includes("status") || action.includes("publish")) return "warn";
  if (action.startsWith("auth")) return "accent";
  if (action.includes("create") || action.includes("upload")) return "ok";
  return "neutral";
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; page?: string }>;
}) {
  await requireUser("admin");
  const { kind = "", page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const take = 40;

  const where = kind ? { action: { startsWith: `${kind}.` } } : {};
  const [rows, total] = await Promise.all([
    prisma.auditLog
      .findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          summary: true,
          ip: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      })
      .catch(() => []),
    prisma.auditLog.count({ where }).catch(() => 0),
  ]);
  const pages = Math.max(1, Math.ceil(total / take));
  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ ...(kind ? { kind } : {}), ...(page > 1 ? { page: String(page) } : {}), ...patch });
    const s = p.toString();
    return `/admin/audit${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Site"
        title={
          <>
            Activity log<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Every change made through the admin, who made it, and when. Read-only."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = kind === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={qs({ kind: f.key, page: "" })}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                active
                  ? "border-[rgba(255,106,38,0.55)] bg-[var(--a-accent-soft)] text-[var(--a-accent)]"
                  : "border-[var(--a-line-strong)] text-[var(--a-muted)] hover:text-[var(--a-text)]"
              }`}
            >
              {f.label} · {f.key === "" ? total : ""}
            </Link>
          );
        })}
      </div>

      <Card padded={false}>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nothing recorded yet" description="Actions will appear here as soon as someone edits, publishes or signs in." />
          </div>
        ) : (
          <div className="a-scroll overflow-x-auto">
            <table className="a-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Action</th>
                  <th>What</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap">
                      <span className="text-[12px]">{shortDate(row.createdAt)}</span>
                      <span className="a-faint ml-1.5 text-[10.5px]">
                        {row.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-[12px]">{row.user?.name ?? "System"}</td>
                    <td>
                      <Badge tone={toneFor(row.action)}>{row.action}</Badge>
                    </td>
                    <td className="max-w-[380px]">
                      <span className="block truncate text-[12px]">{row.summary ?? "—"}</span>
                      {row.entity && (
                        <span className="a-faint text-[10.5px]">
                          {row.entity}
                          {row.entityId ? ` #${row.entityId}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="a-faint whitespace-nowrap text-[10.5px]">{row.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-[11.5px]" aria-label="Pagination">
          <span className="a-faint">
            Page {page} of {pages} · {total} entries
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={qs({ page: String(page - 1) })} className="a-btn a-btn-sm">
                Previous
              </Link>
            )}
            {page < pages && (
              <Link href={qs({ page: String(page + 1) })} className="a-btn a-btn-sm">
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
