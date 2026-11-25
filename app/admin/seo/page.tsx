import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, PageHeader, Progress, Stat } from "../_ui/primitives";
import { Icon } from "../_ui/icons";
import { collectRoutes, type RouteRow } from "@/lib/seo-routes";

export type { RouteRow };

export default async function SeoWorkspace() {
  await requireUser("editor");
  const rows = await collectRoutes();
  const [redirects, missing] = await Promise.all([
    prisma.redirect.count().catch(() => 0),
    prisma.notFoundLog.count().catch(() => 0),
  ]);

  const complete = rows.filter((r) => r.title && r.description).length;
  const partial = rows.filter((r) => (r.title && !r.description) || (!r.title && r.description)).length;
  const none = rows.length - complete - partial;
  const coverage = rows.length === 0 ? 0 : Math.round((complete / rows.length) * 100);

  const groups = ["Static", "Services", "Case studies", "Insights", "Legal"].filter((g) => rows.some((r) => r.group === g));

  return (
    <div>
      <PageHeader
        eyebrow="Grow"
        title={
          <>
            SEO &amp; AEO<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Per-route titles, descriptions, schema and indexing. This is what Google, Bing and AI answer engines read."
        actions={
          <>
            <Link href="/admin/seo/health" className="a-btn a-btn-primary">
              <Icon name="globe" className="h-3.5 w-3.5" /> Site health
            </Link>
            <Link href="/admin/seo/bulk" className="a-btn">
              Bulk edit
            </Link>
            <Link href="/admin/seo/search" className="a-btn">
              Search performance
            </Link>
            <Link href="/admin/seo/redirects" className="a-btn">
              Redirects ({redirects})
            </Link>
            <Link href="/admin/seo/not-found" className="a-btn">
              Broken URLs ({missing})
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Routes tracked" value={rows.length} hint="Static, services, case studies, posts" />
        <Stat label="Title + description" value={complete} hint={`${coverage}% with a hand-written snippet`} tone={coverage >= 70 ? "ok" : "warn"} />
        <Stat label="Auto-generated" value={partial + none} hint={`${none} untouched · ${partial} partial`} tone={partial + none === 0 ? "ok" : undefined} />
        <Stat label="Indexing hints" value={redirects + missing} hint="Redirects + broken URLs seen" />
      </div>

      <div className="mt-4">
        <Card>
          <div className="mb-1 flex items-center justify-between text-[11.5px]">
            <span className="a-muted">Metadata coverage across every indexable route</span>
            <span className="tabular-nums">{coverage}%</span>
          </div>
          <Progress value={coverage} tone={coverage >= 70 ? "ok" : "warn"} />
          <p className="a-faint mt-2 text-[11px]">
            Pages without an override still publish a generated title and description. Adding an override is how you control the exact snippet.
          </p>
        </Card>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map((group) => {
          const groupRows = rows.filter((r) => r.group === group);
          const done = groupRows.filter((r) => r.title && r.description).length;
          return (
            <section key={group}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="a-title text-[15px]">{group}</h2>
                <Badge tone={done === groupRows.length ? "ok" : "neutral"}>
                  {done}/{groupRows.length}
                </Badge>
              </div>
              <Card padded={false}>
                <div className="a-scroll overflow-x-auto">
                  <table className="a-table">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Schema</th>
                        <th className="text-right">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupRows.map((row) => (
                        <tr key={row.path}>
                          <td className="max-w-[220px]">
                            <Link href={`/admin/seo/edit?path=${encodeURIComponent(row.path)}`} className="block truncate text-[12.5px] font-medium hover:text-[var(--a-accent)]">
                              {row.label}
                            </Link>
                            <span className="a-faint a-mono block truncate text-[10px]">{row.path}</span>
                          </td>
                          <td className="max-w-[240px]">
                            {row.title ? (
                              <span className="block truncate text-[12px]">{row.title}</span>
                            ) : (
                              <span className="a-badge a-badge-warn">auto</span>
                            )}
                          </td>
                          <td className="max-w-[260px]">
                            {row.description ? (
                              <span className="flex items-center gap-2">
                                <span className="a-faint block truncate text-[11.5px]" title={row.description}>
                                  {row.description}
                                </span>
                                <span className={`a-badge shrink-0 ${row.description.length > 160 ? "a-badge-warn" : "a-badge-ok"}`}>
                                  {row.description.length}
                                </span>
                              </span>
                            ) : (
                              <span className="a-badge a-badge-warn">auto</span>
                            )}
                          </td>
                          <td>
                            {row.schemaType ? (
                              <Badge tone="accent">{row.schemaType}</Badge>
                            ) : row.schema.length > 0 ? (
                              <span className="a-faint a-mono text-[10.5px]">{row.schema.join(" · ")}</span>
                            ) : (
                              <span className="a-faint text-[11px]">—</span>
                            )}
                          </td>
                          <td className="text-right">
                            <Link href={`/admin/seo/edit?path=${encodeURIComponent(row.path)}`} className="a-btn a-btn-sm">
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          );
        })}
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-start gap-3">
          <Icon name="globe" className="mt-0.5 h-4 w-4 text-[var(--a-accent)]" />
          <div className="min-w-0 flex-1">
            <h2 className="a-title text-[14px]">AI answer-engine files</h2>
            <p className="a-faint mt-1 max-w-xl text-[11.5px] leading-relaxed">
              <span className="a-mono">/llms.txt</span> is generated from the CMS on every revalidation.{" "}
              <span className="a-mono">/llms-full.txt</span> is a hand-written long-form brief in{" "}
              <span className="a-mono">public/</span> — update it when the offer changes.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href="/llms.txt" target="_blank" rel="noreferrer" className="a-btn a-btn-sm">Open llms.txt</a>
              <a href="/llms-full.txt" target="_blank" rel="noreferrer" className="a-btn a-btn-sm">Open llms-full.txt</a>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex flex-wrap items-start gap-3">
          <Icon name="bolt" className="mt-0.5 h-4 w-4 text-[var(--a-accent)]" />
          <div>
            <h2 className="a-title text-[14px]">IndexNow</h2>
            <p className="a-faint mt-1 max-w-xl text-[11.5px] leading-relaxed">
              Add an IndexNow key in Settings → Analytics to ping Bing and Yandex automatically when a post or case study is published.
            </p>
          </div>
          <Link href="/admin/settings#analytics" className="a-btn a-btn-sm ml-auto">
            Open settings
          </Link>
        </div>
      </Card>
    </div>
  );
}
