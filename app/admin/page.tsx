import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS, COLLECTION_KEYS } from "./config";

async function count(fn: () => Promise<number>) {
  try {
    return await fn();
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const [posts, projects, services, team, jobs, testimonials, unread, recent] = await Promise.all([
    count(() => prisma.post.count()),
    count(() => prisma.project.count()),
    count(() => prisma.service.count()),
    count(() => prisma.teamMember.count()),
    count(() => prisma.job.count()),
    count(() => prisma.testimonial.count()),
    count(() => prisma.lead.count({ where: { read: false } })),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
  ]);
  const cards = [
    { href: "/admin/posts", label: "Blog Posts", n: posts },
    { href: "/admin/projects", label: "Case Studies", n: projects },
    { href: "/admin/services", label: "Services", n: services },
    { href: "/admin/team", label: "Team", n: team },
    { href: "/admin/jobs", label: "Jobs", n: jobs },
    { href: "/admin/testimonials", label: "Testimonials", n: testimonials },
  ];
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Dashboard</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ivory">Studio overview<span className="text-sienna">.</span></h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card-surface group p-6">
            <p className="font-display text-4xl font-semibold text-ivory tabular-nums">{c.n}</p>
            <p className="mt-2 font-body text-sm text-ivory/55 transition-colors group-hover:text-sienna-bright">{c.label} →</p>
          </Link>
        ))}
      </div>
      <div className="card-surface mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ivory">Latest leads{unread > 0 ? ` (${unread} unread)` : ""}</h2>
          <Link href="/admin/leads" className="font-body text-sm text-sienna-bright hover:underline">Open inbox →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 font-body text-sm text-ivory/45">No leads yet. Form submissions land here.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-olive/15 pt-3 font-body text-sm">
                <span className="text-ivory/80">{l.name ?? l.email} <span className="text-ivory/40">· {l.kind}</span></span>
                <span className="text-xs text-ivory/40">{new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{l.read ? "" : " · unread"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-6 font-body text-xs text-ivory/35">Collections: {COLLECTION_KEYS.map((k) => COLLECTIONS[k].label).join(" · ")}</p>
    </div>
  );
}