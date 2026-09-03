import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS, COLLECTION_KEYS } from "./config";

async function safe<T>(fn: () => Promise<T>, fb: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fb;
  }
}

export default async function AdminDashboard() {
  const [counts, unread, drafts, recentLeads, recentPosts] = await Promise.all([
    Promise.all([
      safe(() => prisma.post.count(), 0),
      safe(() => prisma.project.count(), 0),
      safe(() => prisma.service.count(), 0),
      safe(() => prisma.teamMember.count(), 0),
      safe(() => prisma.job.count(), 0),
      safe(() => prisma.testimonial.count(), 0),
    ]),
    safe(() => prisma.lead.count({ where: { read: false } }), 0),
    safe(() => prisma.post.count({ where: { published: false } }), 0).then(async (p) => ({
      posts: p,
      projects: await safe(() => prisma.project.count({ where: { published: false } }), 0),
    })),
    safe(() => prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }), []),
    safe(() => prisma.post.findMany({ orderBy: { updatedAt: "desc" }, take: 4, select: { id: true, title: true, updatedAt: true, published: true } }), []),
  ]);
  const [posts, projects, services, team, jobs, testimonials] = counts;
  const cards = [
    { href: "/admin/posts", label: "Blog Posts", n: posts },
    { href: "/admin/projects", label: "Case Studies", n: projects },
    { href: "/admin/services", label: "Services", n: services },
    { href: "/admin/team", label: "Team", n: team },
    { href: "/admin/jobs", label: "Jobs", n: jobs },
    { href: "/admin/testimonials", label: "Testimonials", n: testimonials },
  ];
  const draftTotal = drafts.posts + drafts.projects;
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Dashboard</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-ivory md:text-4xl">Studio overview<span className="text-sienna">.</span></h1>
        <div className="flex gap-2">
          <Link href="/admin/posts/new" className="btn btn-secondary !px-4 !py-2 !text-xs">+ New post</Link>
          <Link href="/admin/projects/new" className="btn btn-primary !px-4 !py-2 !text-xs">+ New project</Link>
        </div>
      </div>
      {(unread > 0 || draftTotal > 0) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {unread > 0 && (
            <Link href="/admin/leads" className="rounded-xl border border-sienna/40 bg-sienna/10 px-4 py-2.5 font-body text-sm text-sienna-bright transition-colors hover:bg-sienna/15">
              {unread} unread lead{unread === 1 ? "" : "s"} →
            </Link>
          )}
          {draftTotal > 0 && (
            <span className="rounded-xl border border-olive/30 bg-umber/60 px-4 py-2.5 font-body text-sm text-ivory/65">
              {draftTotal} draft{draftTotal === 1 ? "" : "s"} waiting to publish
            </span>
          )}
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card-surface group p-6 transition-colors hover:border-sienna/40">
            <p className="font-display text-4xl font-semibold text-ivory tabular-nums md:text-5xl">{c.n}</p>
            <p className="mt-2 font-body text-sm text-ivory/55 transition-colors group-hover:text-sienna-bright">{c.label} →</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ivory">Latest leads</h2>
            <Link href="/admin/leads" className="font-body text-sm text-sienna-bright hover:underline">Inbox →</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="mt-4 font-body text-sm text-ivory/45">No submissions yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentLeads.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-olive/15 pt-3 font-body text-sm">
                  <span className="text-ivory/80">{l.name ?? l.email} <span className="text-ivory/40">· {l.kind}</span></span>
                  <span className="text-xs text-ivory/40">{new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{l.read ? "" : " · unread"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ivory">Recently touched posts</h2>
            <Link href="/admin/posts" className="font-body text-sm text-sienna-bright hover:underline">All posts →</Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="mt-4 font-body text-sm text-ivory/45">Nothing yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentPosts.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-olive/15 pt-3 font-body text-sm">
                  <Link href={`/admin/posts/${p.id}`} className="text-ivory/80 hover:text-sienna-bright">{p.title}</Link>
                  <span className="flex items-center gap-2 text-xs text-ivory/40">
                    <span className={`h-1.5 w-1.5 rounded-full ${p.published ? "bg-emerald-400" : "bg-amber-400"}`} aria-hidden="true" />
                    {p.published ? "live" : "draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="mt-6 font-body text-xs text-ivory/35">Collections: {COLLECTION_KEYS.map((k) => COLLECTIONS[k].label).join(" · ")}</p>
    </div>
  );
}
