import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "./actions";
import { AdminNav } from "./nav";

export default async function AdminLayout({ children }: { children: React.ReactNode; params: Promise<unknown> }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/admin/login")) return <>{children}</>;
  let unread = 0;
  let online = false;
  try {
    unread = await prisma.lead.count({ where: { read: false } });
    online = true;
  } catch {
    unread = 0;
    online = false;
  }
  return (
    <div className="min-h-svh bg-espresso text-ivory">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:gap-8 md:px-8 md:py-8">
        <aside className="w-full shrink-0 md:w-64">
          <div className="md:sticky md:top-8">
            <Link href="/admin" className="flex items-center gap-2.5 px-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sienna font-display text-sm font-bold text-espresso">Z</span>
              <span className="font-display text-lg font-semibold">
                Zoolyum<span className="text-sienna">.</span>
              </span>
              <span className="rounded-full border border-olive/35 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/50">
                Admin
              </span>
            </Link>
            <div className="mt-5">
              <AdminNav unread={unread} />
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-end gap-2 border-b border-olive/15 pb-4">
            <span className="mr-auto hidden items-center gap-2 font-body text-xs text-ivory/40 sm:flex" title={online ? "Database connected" : "Database unreachable - showing fallback data"}>
              <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-400" : "bg-red-400"}`} aria-hidden="true" />
              {online ? "DB connected" : "DB offline"}
            </span>
            <a href="/" target="_blank" rel="noreferrer" className="rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/70 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
              View site
            </a>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/70 transition-colors hover:border-red-400/50 hover:text-red-300">
                Log out
              </button>
            </form>
          </div>
          <main className="pb-16">{children}</main>
        </div>
      </div>
    </div>
  );
}
