import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HomeEditor } from "../ui-home";

export default async function HomeAdminPage() {
  const rows = await prisma.siteSetting
    .findMany({ where: { OR: [{ key: { startsWith: "home." } }, { key: { startsWith: "work." } }] } })
    .catch(() => [] as { key: string; value: string }[]);
  const initial: Record<string, string> = {};
  for (const r of rows) initial[r.key] = r.value;
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 font-body text-xs text-ivory/40">
        <Link href="/admin" className="transition-colors hover:text-sienna-bright">Admin</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ivory/70">Homepage</span>
      </nav>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">
        Studio / Homepage
      </p>
      <h1 className="mb-8 mt-3 font-display text-3xl font-semibold text-ivory">
        Homepage<span className="text-sienna">.</span>
      </h1>
      <HomeEditor initial={initial} />
    </div>
  );
}
