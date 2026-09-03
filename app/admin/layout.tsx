import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "./actions";
import { COLLECTIONS, COLLECTION_KEYS } from "./config";

export default async function AdminLayout({ children }: { children: React.ReactNode; params: Promise<unknown> }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/admin/login")) return <>{children}</>;
  let unread = 0;
  try {
    unread = await prisma.lead.count({ where: { read: false } });
  } catch {
    unread = 0;
  }
  return (
    <div className="min-h-svh bg-espresso text-ivory">
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8">
        <aside className="w-full shrink-0 md:w-60">
          <div className="md:sticky md:top-8">
            <Link href="/admin" className="font-display text-lg font-semibold">
              Zoolyum<span className="text-sienna">.</span>
              <span className="ml-2 rounded-full border border-olive/35 px-2 py-0.5 align-middle font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/50">
                Admin
              </span>
            </Link>
            <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col" aria-label="Admin">
              <AdminLink href="/admin" label="Dashboard" />
              <p className="hidden px-3 pt-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/35 md:block">
                Content
              </p>
              {COLLECTION_KEYS.map((k) => (
                <AdminLink key={k} href={`/admin/${k}`} label={COLLECTIONS[k].label} />
              ))}
              <p className="hidden px-3 pt-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/35 md:block">
                Studio
              </p>
              <AdminLink href="/admin/settings" label="Site settings" />
              <AdminLink href="/admin/leads" label={unread > 0 ? `Leads (${unread})` : "Leads"} />
              <AdminLink href="/admin/media" label="Media" />
            </nav>
            <div className="mt-6 flex gap-2 border-t border-olive/20 pt-4">
              <a href="/" target="_blank" rel="noreferrer" className="btn btn-secondary flex-1 !px-3 !py-2 !text-xs">
                View site
              </a>
              <form action={logoutAction}>
                <button type="submit" className="rounded-lg border border-olive/35 px-3 py-2 font-body text-xs text-ivory/65 hover:border-red-400/50 hover:text-red-300">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-lg border border-transparent px-3 py-2 font-body text-sm text-ivory/70 transition-colors hover:border-olive/30 hover:text-ivory"
    >
      {label}
    </Link>
  );
}