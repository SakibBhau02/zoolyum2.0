import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Breadcrumbs, Card, EmptyState, PageHeader } from "../../_ui/primitives";
import { ClearButton } from "./clear-button";

export default async function NotFoundLogPage() {
  await requireUser("editor");
  const rows = await prisma.notFoundLog.findMany({ orderBy: [{ hits: "desc" }, { lastSeenAt: "desc" }], take: 100 }).catch(() => []);
  const total = rows.reduce((n, r) => n + r.hits, 0);

  return (
    <div>
      <Breadcrumbs items={[{ label: "SEO", href: "/admin/seo" }, { label: "Broken URLs" }]} />
      <PageHeader
        eyebrow="Grow"
        title={
          <>
            Broken URLs<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Every 404 visitors actually hit. Turn the loud ones into redirects so the link equity and the visitor both survive."
        actions={
          <>
            <Link href="/admin/seo/redirects" className="a-btn">Redirects</Link>
            <ClearButton />
          </>
        }
      />

      <Card padded={false}>
        <div className="border-b border-[var(--a-line)] px-5 py-3.5">
          <h2 className="a-title text-[15px]">Recent misses</h2>
          <p className="a-faint mt-0.5 text-[11px]">
            {rows.length} unique URL{rows.length === 1 ? "" : "s"} · {total} hit{total === 1 ? "" : "s"} recorded
          </p>
        </div>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No broken URLs recorded" description="This fills up as visitors — or crawlers — request pages that do not exist." />
          </div>
        ) : (
          <div className="a-scroll overflow-x-auto">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Path</th>
                  <th>Hits</th>
                  <th>Last seen</th>
                  <th className="text-right">Fix</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="a-mono max-w-[360px]">
                      <span className="block truncate">{row.path}</span>
                    </td>
                    <td className="tabular-nums text-[12px]">{row.hits}</td>
                    <td className="a-faint text-[11px]">
                      {row.lastSeenAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{" "}
                      {row.lastSeenAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/seo/redirects?source=${encodeURIComponent(row.path)}`}
                          className="a-btn a-btn-sm"
                        >
                          Add redirect
                        </Link>
                        <ClearButton id={row.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
