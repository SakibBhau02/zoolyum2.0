import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Breadcrumbs, Card, EmptyState, PageHeader } from "../../_ui/primitives";
import { NewRedirectForm, RedirectRow } from "./manager";

export default async function RedirectsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  await requireUser("editor");
  const { source } = await searchParams;
  const rows = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  const active = rows.filter((r) => r.active).length;
  const hits = rows.reduce((n, r) => n + r.hits, 0);

  return (
    <div>
      <Breadcrumbs items={[{ label: "SEO", href: "/admin/seo" }, { label: "Redirects" }]} />
      <PageHeader
        eyebrow="Grow"
        title={
          <>
            Redirects<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Keep old links and campaign URLs working. 301 for permanent moves, 302 while testing."
        actions={
          <Link href="/admin/seo/not-found" className="a-btn">
            Broken URLs
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card padded={false}>
          <div className="border-b border-[var(--a-line)] px-5 py-3.5">
            <h2 className="a-title text-[15px]">All redirects</h2>
            <p className="a-faint mt-0.5 text-[11px]">
              {rows.length} rule{rows.length === 1 ? "" : "s"} · {active} active · {hits} total hit{hits === 1 ? "" : "s"}
            </p>
          </div>
          {rows.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No redirects yet" description="When a page moves, add a rule here so the old URL never 404s." />
            </div>
          ) : (
            <div className="a-scroll overflow-x-auto">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Code</th>
                    <th>Hits</th>
                    <th>State</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <RedirectRow
                      key={row.id}
                      row={{
                        id: row.id,
                        source: row.source,
                        destination: row.destination,
                        statusCode: row.statusCode,
                        hits: row.hits,
                        active: row.active,
                        note: row.note,
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="a-title text-[15px]">Add a redirect</h2>
          <p className="a-faint mb-4 mt-1 text-[11.5px]">Source must be a path on this site. Destination can be internal or external.</p>
          <NewRedirectForm defaultSource={source ?? ""} />
        </Card>
      </div>
    </div>
  );
}
