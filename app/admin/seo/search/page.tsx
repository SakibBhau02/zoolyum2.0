import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBing, getSearchConsole, searchConsoleConfigured, bingConfigured } from "@/lib/search-console";
import { Badge, Breadcrumbs, Card, CardHeader, EmptyState, Notice, PageHeader, Stat } from "../../_ui/primitives";
import { Icon } from "../../_ui/icons";

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function SearchPerformancePage() {
  await requireUser("editor");
  const [gsc, bing] = await Promise.all([getSearchConsole(28), getBing(28)]);
  const configured = searchConsoleConfigured() || bingConfigured();

  return (
    <div>
      <Breadcrumbs items={[{ label: "SEO", href: "/admin/seo" }, { label: "Search performance" }]} />
      <PageHeader
        eyebrow="Grow"
        title={
          <>
            Search performance<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="What Google and Bing actually show people, pulled straight from the source. Last 28 days, cached for 30 minutes."
        actions={
          <Link href="/admin/seo" className="a-btn">
            Back to SEO
          </Link>
        }
      />

      {!configured && (
        <Card>
          <CardHeader
            title="Connect Search Console (and optionally Bing)"
            hint="Credentials stay in environment variables. Nothing is stored in the database."
            action={<Badge tone="warn">Not connected</Badge>}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="a-card-quiet p-4">
              <div className="flex items-center gap-2">
                <Icon name="globe" className="h-4 w-4 text-[var(--a-accent)]" />
                <h3 className="a-title text-[14px]">Google Search Console</h3>
              </div>
              <ol className="a-muted mt-3 list-decimal space-y-1.5 pl-4 text-[11.5px] leading-relaxed">
                <li>Create a service account in Google Cloud and enable the Search Console API.</li>
                <li>Add the service-account email as a user on the Search Console property.</li>
                <li>Set the three variables below in Vercel (Production + Preview).</li>
              </ol>
              <pre className="a-mono mt-3 overflow-x-auto rounded-[8px] border border-[var(--a-line)] bg-[#171310] p-3 text-[11px] leading-relaxed">
{`GSC_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."
GSC_PROPERTY=https://www.zoolyum.com/`}
              </pre>
            </div>

            <div className="a-card-quiet p-4">
              <div className="flex items-center gap-2">
                <Icon name="search" className="h-4 w-4 text-[var(--a-accent)]" />
                <h3 className="a-title text-[14px]">Bing Webmaster</h3>
              </div>
              <ol className="a-muted mt-3 list-decimal space-y-1.5 pl-4 text-[11.5px] leading-relaxed">
                <li>Open Bing Webmaster Tools → Settings → API access.</li>
                <li>Generate an API key for the site.</li>
                <li>Add both variables below. `BING_SITE_URL` defaults to the canonical site URL.</li>
              </ol>
              <pre className="a-mono mt-3 overflow-x-auto rounded-[8px] border border-[var(--a-line)] bg-[#171310] p-3 text-[11px] leading-relaxed">
{`BING_WEBMASTER_API_KEY=...
BING_SITE_URL=https://www.zoolyum.com/`}
              </pre>
            </div>
          </div>
        </Card>
      )}

      {searchConsoleConfigured() && (
        <>
          {gsc.error && (
            <div className="mb-4">
              <Notice tone="bad">{gsc.error}</Notice>
            </div>
          )}
          {gsc.totals && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Clicks" value={gsc.totals.clicks.toLocaleString()} hint="Search Console, 28 days" />
              <Stat label="Impressions" value={gsc.totals.impressions.toLocaleString()} hint="Search Console, 28 days" />
              <Stat label="Average CTR" value={pct(gsc.totals.ctr)} hint="Across the top queries" />
              <Stat label="Average position" value={gsc.totals.position.toFixed(1)} hint="Lower is better" />
            </div>
          )}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card padded={false}>
              <div className="border-b border-[var(--a-line)] px-5 py-3.5">
                <h2 className="a-title text-[15px]">Top queries</h2>
                <p className="a-faint mt-0.5 text-[11px]">Search Console · last 28 days</p>
              </div>
              {gsc.rows.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No query data yet" description="Search Console needs a few days of impressions before rows appear." />
                </div>
              ) : (
                <div className="a-scroll overflow-x-auto">
                  <table className="a-table">
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th className="text-right">Clicks</th>
                        <th className="text-right">Impr.</th>
                        <th className="text-right">CTR</th>
                        <th className="text-right">Pos.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gsc.rows.map((row) => (
                        <tr key={row.key}>
                          <td className="max-w-[280px]">
                            <span className="block truncate text-[12.5px]">{row.key}</span>
                          </td>
                          <td className="text-right tabular-nums text-[12px]">{row.clicks}</td>
                          <td className="text-right tabular-nums text-[12px]">{row.impressions}</td>
                          <td className="text-right tabular-nums text-[12px]">{pct(row.ctr)}</td>
                          <td className="text-right tabular-nums text-[12px]">{row.position.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card padded={false}>
              <div className="border-b border-[var(--a-line)] px-5 py-3.5">
                <h2 className="a-title text-[15px]">Top pages</h2>
                <p className="a-faint mt-0.5 text-[11px]">Search Console · last 28 days</p>
              </div>
              {gsc.pages.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No page data yet" description="Once the site earns impressions, the strongest URLs appear here." />
                </div>
              ) : (
                <div className="a-scroll overflow-x-auto">
                  <table className="a-table">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th className="text-right">Clicks</th>
                        <th className="text-right">Impr.</th>
                        <th className="text-right">CTR</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {gsc.pages.map((row) => {
                        const path = (() => {
                          try {
                            return new URL(row.key).pathname;
                          } catch {
                            return row.key;
                          }
                        })();
                        return (
                          <tr key={row.key}>
                            <td className="max-w-[260px]">
                              <span className="a-mono block truncate text-[11px]">{path}</span>
                            </td>
                            <td className="text-right tabular-nums text-[12px]">{row.clicks}</td>
                            <td className="text-right tabular-nums text-[12px]">{row.impressions}</td>
                            <td className="text-right tabular-nums text-[12px]">{pct(row.ctr)}</td>
                            <td className="text-right">
                              <Link href={`/admin/seo/edit?path=${encodeURIComponent(path)}`} className="a-btn a-btn-sm">
                                Edit SEO
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {bingConfigured() && (
        <Card className="mt-4" padded={false}>
          <div className="flex items-center justify-between border-b border-[var(--a-line)] px-5 py-3.5">
            <div>
              <h2 className="a-title text-[15px]">Bing queries</h2>
              <p className="a-faint mt-0.5 text-[11px]">Bing Webmaster · last 28 days</p>
            </div>
            {bing.totals && (
              <span className="a-faint text-[11px]">
                {bing.totals.clicks.toLocaleString()} clicks · {bing.totals.impressions.toLocaleString()} impressions
              </span>
            )}
          </div>
          {bing.error && (
            <div className="p-4">
              <Notice tone="bad">{bing.error}</Notice>
            </div>
          )}
          {!bing.error && bing.rows.length === 0 && (
            <div className="p-5">
              <EmptyState title="No Bing query data" description="Bing reports appear once the site has impressions there." />
            </div>
          )}
          {bing.rows.length > 0 && (
            <div className="a-scroll overflow-x-auto">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Query</th>
                    <th className="text-right">Clicks</th>
                    <th className="text-right">Impressions</th>
                    <th className="text-right">CTR</th>
                    <th className="text-right">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {bing.rows.map((row) => (
                    <tr key={row.key}>
                      <td className="max-w-[320px]">
                        <span className="block truncate text-[12.5px]">{row.key}</span>
                      </td>
                      <td className="text-right tabular-nums text-[12px]">{row.clicks}</td>
                      <td className="text-right tabular-nums text-[12px]">{row.impressions}</td>
                      <td className="text-right tabular-nums text-[12px]">{pct(row.ctr)}</td>
                      <td className="text-right tabular-nums text-[12px]">{row.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
