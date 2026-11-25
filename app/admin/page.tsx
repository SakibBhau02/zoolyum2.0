import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardHeader, EmptyState, PageHeader, Progress, Stat } from "./_ui/primitives";
import { Icon } from "./_ui/icons";
import { relativeTime, truncate } from "./_ui/format";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;

  const [
    user,
    unread,
    posts,
    projects,
    services,
    drafts,
    review,
    leads,
    notFound,
    activeRedirects,
    seoRows,
    describedSettings,
    auditRows,
    recentPosts,
  ] = await Promise.all([
    requireUser("viewer"),
    safe(() => prisma.lead.count({ where: { read: false } }), 0),
    safe(() => prisma.post.count({ where: { published: true } }), 0),
    safe(() => prisma.project.count({ where: { published: true } }), 0),
    safe(() => prisma.service.count(), 0),
    safe(async () => (await prisma.post.count({ where: { status: "draft" } })) + (await prisma.project.count({ where: { status: "draft" } })), 0),
    safe(async () => (await prisma.post.count({ where: { status: "review" } })) + (await prisma.project.count({ where: { status: "review" } })), 0),
    safe(
      () =>
        prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, kind: true, name: true, email: true, read: true, createdAt: true },
        }),
      [],
    ),
    safe(() => prisma.notFoundLog.findMany({ orderBy: { hits: "desc" }, take: 3 }), []),
    safe(() => prisma.redirect.count({ where: { active: true } }), 0),
    safe(() => prisma.seoMeta.count(), 0),
    safe(() => prisma.siteSetting.count({ where: { key: { startsWith: "seo.", endsWith: ".description" } } }), 0),
    safe(
      () =>
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          select: { id: true, action: true, summary: true, createdAt: true, user: { select: { name: true } } },
        }),
      [],
    ),
    safe(
      () =>
        prisma.post.findMany({
          orderBy: { updatedAt: "desc" },
          take: 4,
          select: { id: true, title: true, status: true, updatedAt: true },
        }),
      [],
    ),
  ]);

  const indexable = posts + projects + services + 15; // 15 static marketing routes
  // Every post/case study/service ships a generated description; static pages
  // rely on the per-page `seo.*.description` settings.
  const described = describedSettings + posts + projects + services;
  const seoCoverage = indexable === 0 ? 0 : Math.min(100, Math.round((described / indexable) * 100));
  const seoMissing = Math.max(0, indexable - described);
  const attention: { label: string; href: string; tone: "warn" | "bad" | "accent" }[] = [];
  if (unread > 0) attention.push({ label: `${unread} unread lead${unread === 1 ? "" : "s"} waiting`, href: "/admin/leads", tone: "accent" });
  if (review > 0) attention.push({ label: `${review} item${review === 1 ? "" : "s"} in review`, href: "/admin/posts?status=review", tone: "warn" });
  if (drafts > 0) attention.push({ label: `${drafts} draft${drafts === 1 ? "" : "s"} not published`, href: "/admin/posts?status=draft", tone: "warn" });
  if (notFound.length > 0) attention.push({ label: `${notFound[0].hits} hits on a missing URL`, href: "/admin/seo/not-found", tone: "bad" });
  if (seoMissing > 0) attention.push({ label: `${seoMissing} page${seoMissing === 1 ? "" : "s"} missing a search description`, href: "/admin/seo", tone: "warn" });

  return (
    <div>
      {denied && (
        <div className="mb-5 rounded-[9px] border border-[rgba(242,181,68,0.35)] bg-[rgba(242,181,68,0.08)] px-3.5 py-2.5 text-[12.5px] text-[var(--a-warn)]">
          Your role does not allow that page. Ask an owner for access.
        </div>
      )}

      <PageHeader
        eyebrow="Dashboard"
        title={
          <>
            Good to see you, {user?.name.split(" ")[0] ?? "there"}
            <span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="What changed, what needs attention, and where the site stands in search."
        actions={
          <>
            <Link href="/admin/posts/new" className="a-btn">
              <Icon name="plus" className="h-3.5 w-3.5" /> New post
            </Link>
            <Link href="/admin/projects/new" className="a-btn a-btn-primary">
              <Icon name="plus" className="h-3.5 w-3.5" /> New case study
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Published posts" value={posts} hint={`${drafts} draft${drafts === 1 ? "" : "s"}`} href="/admin/posts" />
        <Stat label="Case studies" value={projects} hint="Live portfolio" href="/admin/projects" />
        <Stat label="Unread leads" value={unread} hint={unread === 0 ? "Inbox clear" : "Needs a reply"} tone={unread === 0 ? "ok" : undefined} href="/admin/leads" />
        <Stat
          label="Pages with metadata"
          value={`${seoCoverage}%`}
          hint={`${seoRows} hand-written override${seoRows === 1 ? "" : "s"}`}
          tone={seoCoverage >= 90 ? "ok" : "warn"}
          href="/admin/seo/health"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader
            title="Needs attention"
            hint="Highest impact first. Each row links straight to the fix."
            action={<Badge tone={attention.length > 0 ? "warn" : "ok"}>{attention.length > 0 ? `${attention.length} open` : "All clear"}</Badge>}
          />
          {attention.length === 0 ? (
            <EmptyState title="Nothing waiting" description="Every draft is published, the inbox is clear, and no broken URLs were hit recently." />
          ) : (
            <ul className="space-y-1">
              {attention.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-[9px] px-2.5 py-2.5 text-[12.5px] transition-colors hover:bg-[rgba(246,241,232,0.04)]"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        item.tone === "bad" ? "bg-[var(--a-bad)]" : item.tone === "warn" ? "bg-[var(--a-warn)]" : "bg-[var(--a-accent)]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item.label}</span>
                    <Icon name="chevron" className="h-3.5 w-3.5 text-[var(--a-faint)]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="a-divide mt-4 pt-4">
            <div className="mb-2 flex items-center justify-between text-[11.5px]">
              <span className="a-muted">Metadata coverage</span>
              <span className="tabular-nums">{seoCoverage}%</span>
            </div>
            <Progress value={seoCoverage} tone={seoCoverage >= 60 ? "ok" : "warn"} />
            <p className="a-faint mt-2 text-[11px]">
              {activeRedirects} active redirect{activeRedirects === 1 ? "" : "s"} ·{" "}
              <Link href="/admin/seo" className="underline underline-offset-2 hover:text-[var(--a-accent)]">
                open the SEO workspace
              </Link>
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Latest leads" hint="Newest submissions across every form." action={<Link href="/admin/leads" className="a-btn a-btn-ghost a-btn-sm">Inbox</Link>} />
          {leads.length === 0 ? (
            <EmptyState title="No submissions yet" description="Contact, careers and newsletter forms all land here." />
          ) : (
            <ul className="space-y-2.5">
              {leads.map((lead) => (
                <li key={lead.id} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${lead.read ? "bg-[var(--a-line-strong)]" : "bg-[var(--a-accent)]"}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px]">{lead.name || lead.email}</p>
                    <p className="a-faint text-[11px]">
                      {lead.kind} · {relativeTime(lead.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recently edited" hint="Jump back into the last four posts." action={<Link href="/admin/posts" className="a-btn a-btn-ghost a-btn-sm">All posts</Link>} />
          {recentPosts.length === 0 ? (
            <EmptyState title="No posts yet" description="Write the first one and it will show up here." />
          ) : (
            <ul className="space-y-1">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="flex items-center gap-3 rounded-[9px] px-2.5 py-2.5 text-[12.5px] transition-colors hover:bg-[rgba(246,241,232,0.04)]"
                  >
                    <span className="min-w-0 flex-1 truncate">{truncate(post.title, 58)}</span>
                    <Badge tone={post.status === "published" ? "ok" : post.status === "review" ? "warn" : "neutral"}>{post.status}</Badge>
                    <span className="a-faint shrink-0 text-[10.5px]">{relativeTime(post.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Activity" hint="Who changed what, most recent first." action={<Link href="/admin/audit" className="a-btn a-btn-ghost a-btn-sm">Full log</Link>} />
          {auditRows.length === 0 ? (
            <EmptyState title="No activity recorded yet" description="Edits, publishes and settings changes will appear here." />
          ) : (
            <ul className="space-y-2.5">
              {auditRows.map((row) => (
                <li key={row.id} className="flex items-start gap-2.5">
                  <Icon name="history" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--a-faint)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px]">{row.summary ?? row.action}</p>
                    <p className="a-faint text-[10.5px]">
                      {row.user?.name ?? "System"} · {relativeTime(row.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
