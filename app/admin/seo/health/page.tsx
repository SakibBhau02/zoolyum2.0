import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { runSeoAudit } from "@/lib/seo-audit";
import { SITE_URL } from "@/lib/data";
import { Badge, Card, CardHeader, EmptyState, PageHeader, Progress, Stat } from "../../_ui/primitives";
import { Icon } from "../../_ui/icons";

export const dynamic = "force-dynamic";

const DOT: Record<string, string> = {
  ok: "bg-[var(--a-ok)]",
  warn: "bg-[var(--a-warn)]",
  bad: "bg-[var(--a-bad)]",
  info: "bg-[var(--a-line-strong)]",
};

function scoreOf(statuses: string[]) {
  if (statuses.length === 0) return 0;
  const weight = statuses.reduce((n, s) => n + (s === "ok" ? 1 : s === "warn" ? 0.5 : 0), 0);
  return Math.round((weight / statuses.length) * 100);
}

export default async function SiteHealthPage() {
  await requireUser("editor");
  const audit = await runSeoAudit();
  const { checks, stats, routes, content } = audit;

  const blocking = checks.filter((c) => c.status === "bad");
  const warnings = checks.filter((c) => c.status === "warn");
  const score = scoreOf(checks.map((c) => c.status));
  const needsWork = routes.filter((r) => r.issues.length > 0);

  return (
    <div>
      <PageHeader
        eyebrow="Grow"
        title={
          <>
            Site health<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="A live read of everything Google and the answer engines need: crawlability, metadata, structured data and content depth. Nothing here changes the site — it only reports."
        actions={
          <>
            <a href={`${SITE_URL}/sitemap.xml`} target="_blank" rel="noreferrer" className="a-btn">
              <Icon name="external" className="h-3.5 w-3.5" /> Sitemap
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noreferrer"
              className="a-btn a-btn-primary"
            >
              <Icon name="search" className="h-3.5 w-3.5" /> Search Console
            </a>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Readiness score"
          value={`${score}%`}
          hint={`${checks.filter((c) => c.status === "ok").length} of ${checks.length} checks pass`}
          tone={score >= 85 ? "ok" : score >= 60 ? "warn" : "bad"}
        />
        <Stat label="Indexable routes" value={stats.indexable} hint={`${stats.noindex} noindex · ${stats.routes} tracked`} />
        <Stat
          label="Snippets ready"
          value={`${Math.min(stats.titled, stats.described)}/${stats.indexable}`}
          hint={`${stats.custom} written by hand`}
          tone={stats.titled === stats.indexable && stats.described === stats.indexable ? "ok" : "warn"}
        />
        <Stat
          label="Pages needing work"
          value={needsWork.length}
          hint={
            needsWork.length > 0
              ? `${blocking.length} blocking issue${blocking.length === 1 ? "" : "s"}`
              : blocking.length > 0
                ? `No page issues · ${blocking.length} setup check to finish`
                : warnings.length > 0
                  ? `${warnings.length} optional warning${warnings.length === 1 ? "" : "s"}`
                  : "Nothing blocking"
          }
          tone={needsWork.length === 0 && blocking.length === 0 ? "ok" : "warn"}
          href="/admin/seo"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            title="Indexing readiness"
            hint="The order Google checks the site. Red blocks indexing; amber costs visibility."
            action={<Badge tone={score >= 85 ? "ok" : score >= 60 ? "warn" : "bad"}>{score}%</Badge>}
          />
          <ul className="space-y-2.5">
            {checks.map((check) => (
              <li key={check.id} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[check.status]}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium">{check.label}</p>
                  <p className="a-faint mt-0.5 text-[11.5px] leading-relaxed">{check.detail}</p>
                </div>
                {check.href && (
                  <a
                    href={check.href}
                    target={check.external ? "_blank" : undefined}
                    rel={check.external ? "noreferrer" : undefined}
                    className="a-btn a-btn-ghost a-btn-sm shrink-0"
                  >
                    {check.external ? "Open" : "Fix"}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="What to do, in order" hint="The exact sequence for getting indexed." />
            <ol className="space-y-3">
              {[
                {
                  t: "Verify the domain",
                  d: "Search Console → add the property → paste the token in Settings → Search verification. It is already rendered in the <head>.",
                },
                {
                  t: "Submit the sitemap",
                  d: `Search Console → Sitemaps → add ${SITE_URL}/sitemap.xml. It is built from the CMS, so new posts appear without a redeploy.`,
                },
                {
                  t: "Request indexing",
                  d: "Use URL Inspection on the home page, services and the latest case study. This nudges the first crawl.",
                },
                {
                  t: "Fix every red check",
                  d: "Blocking issues are almost always a missing title, a noindex flag, or an unreachable domain.",
                },
                {
                  t: "Publish on a rhythm",
                  d: "One insight a month beats five in a week. Each post is a new entry point and a new answer-engine citation.",
                },
                {
                  t: "Watch, then refine",
                  d: "Search performance shows which queries already bring impressions. Rewrite those titles first.",
                },
              ].map((step, i) => (
                <li key={step.t} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--a-line-strong)] text-[10px] font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-medium">{step.t}</p>
                    <p className="a-faint mt-0.5 text-[11.5px] leading-relaxed">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader title="Answer-engine files" hint="What AI crawlers read first." />
            <div className="space-y-2">
              {[
                { label: "llms.txt", href: "/llms.txt", hint: "Generated from the CMS" },
                { label: "llms-full.txt", href: "/llms-full.txt", hint: "Long-form brief" },
                { label: "feed.xml", href: "/feed.xml", hint: "RSS for syndication" },
                { label: "robots.txt", href: "/robots.txt", hint: "Crawl policy + sitemap" },
              ].map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-[9px] border border-[var(--a-line)] px-3 py-2.5 text-[12px] transition-colors hover:border-[rgba(255,106,38,0.4)]"
                >
                  <Icon name="file" className="h-3.5 w-3.5 text-[var(--a-faint)]" />
                  <span className="a-mono flex-1">{f.label}</span>
                  <span className="a-faint text-[10.5px]">{f.hint}</span>
                  <Icon name="external" className="h-3 w-3 text-[var(--a-faint)]" />
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {needsWork.length > 0 && (
        <Card className="mt-4">
          <CardHeader
            title="Pages needing work"
            hint="Every row links straight to the editor for that route."
            action={<Badge tone={blocking.length > 0 ? "bad" : "warn"}>{needsWork.length} open</Badge>}
          />
          <div className="a-scroll overflow-x-auto">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Issues</th>
                  <th className="text-right">Fix</th>
                </tr>
              </thead>
              <tbody>
                {needsWork.map((r) => (
                  <tr key={r.path}>
                    <td className="max-w-[220px]">
                      <span className="block truncate text-[12.5px] font-medium">{r.label}</span>
                      <span className="a-faint a-mono block truncate text-[10px]">{r.path}</span>
                    </td>
                    <td className="tabular-nums whitespace-nowrap text-[12px]">
                      <span className={r.titleLen < 30 || r.titleLen > 60 ? "text-[var(--a-warn)]" : ""}>{r.titleLen}</span>
                      <span className="a-faint">/60</span>
                    </td>
                    <td className="tabular-nums whitespace-nowrap text-[12px]">
                      <span className={r.descLen < 110 || r.descLen > 160 ? "text-[var(--a-warn)]" : ""}>{r.descLen}</span>
                      <span className="a-faint">/160</span>
                    </td>
                    <td>
                      <span className="flex flex-wrap gap-1">
                        {r.issues.map((issue) => (
                          <span key={issue.message} className={`a-badge ${issue.level === "bad" ? "a-badge-bad" : "a-badge-warn"}`}>
                            {issue.message}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link href={`/admin/seo/edit?path=${encodeURIComponent(r.path)}`} className="a-btn a-btn-sm">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Content depth"
            hint="Answer engines quote pages that answer questions in full."
            action={
              <Badge tone={content.thinPosts.length + content.postsMissingFaqs.length === 0 ? "ok" : "warn"}>
                {content.thinPosts.length + content.postsMissingFaqs.length} to review
              </Badge>
            }
          />
          {content.thinPosts.length === 0 && content.postsMissingFaqs.length === 0 && content.projectsMissingFaqs.length === 0 && content.servicesMissingFaqs.length === 0 ? (
            <EmptyState title="Content is in good shape" description="Long-form posts, FAQ blocks on services and case studies, and alt text on every gallery image." />
          ) : (
            <div className="space-y-3">
              <Row label="Thin posts (under 600 words)" items={content.thinPosts.map((p) => `${p.slug} (${p.words})`)} href="/admin/posts" />
              <Row label="Posts without an FAQ block" items={content.postsMissingFaqs} href="/admin/posts" />
              <Row label="Case studies without an FAQ block" items={content.projectsMissingFaqs} href="/admin/projects" />
              <Row label="Services without an FAQ block" items={content.servicesMissingFaqs} href="/admin/services" />
              <Row label="Posts without keywords" items={content.postsMissingKeywords} href="/admin/posts" />
              {content.imagesMissingAlt > 0 && (
                <p className="a-faint text-[11.5px]">
                  {content.imagesMissingAlt} gallery image{content.imagesMissingAlt === 1 ? "" : "s"} missing alt text.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Snippet coverage"
            hint="Auto means the page still publishes a generated title or description."
            action={<Badge tone={stats.custom >= stats.indexable ? "ok" : "neutral"}>{stats.custom} custom</Badge>}
          />
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                <span className="a-muted">Titles</span>
                <span className="tabular-nums">{stats.titled}/{stats.indexable}</span>
              </div>
              <Progress value={(stats.titled / Math.max(1, stats.indexable)) * 100} tone="ok" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                <span className="a-muted">Descriptions</span>
                <span className="tabular-nums">{stats.described}/{stats.indexable}</span>
              </div>
              <Progress value={(stats.described / Math.max(1, stats.indexable)) * 100} tone="ok" />
            </div>
            <div className="a-divide pt-3">
              <p className="a-faint text-[11.5px] leading-relaxed">
                {stats.dupTitles} duplicate title{stats.dupTitles === 1 ? "" : "s"} · {stats.dupDescriptions} duplicate
                description{stats.dupDescriptions === 1 ? "" : "s"}. Open the{" "}
                <Link href="/admin/seo" className="underline underline-offset-2 hover:text-[var(--a-accent)]">
                  SEO workspace
                </Link>{" "}
                to edit any route.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, items, href }: { label: string; items: string[]; href: string }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--a-warn)]" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium">
          {label} <span className="a-faint font-normal">({items.length})</span>
        </p>
        <p className="a-faint a-mono mt-0.5 truncate text-[10.5px]">{items.slice(0, 4).join(", ")}{items.length > 4 ? "…" : ""}</p>
      </div>
      <Link href={href} className="a-btn a-btn-ghost a-btn-sm shrink-0">
        Open
      </Link>
    </div>
  );
}
