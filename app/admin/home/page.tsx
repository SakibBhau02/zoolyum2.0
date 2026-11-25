import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "../_ui/primitives";
import { HomeEditor } from "../ui-home";

export default async function HomeAdminPage() {
  await requireUser("editor");
  const rows = await prisma.siteSetting
    .findMany({ where: { OR: [{ key: { startsWith: "home." } }, { key: { startsWith: "work." } }] } })
    .catch(() => [] as { key: string; value: string }[]);
  const projects = await prisma.project
    .findMany({ orderBy: { sort: "asc" }, select: { slug: true, client: true } })
    .catch(() => [] as { slug: string; client: string }[]);
  const initial: Record<string, string> = {};
  for (const r of rows) initial[r.key] = r.value;
  return (
    <div>
      <PageHeader
        eyebrow="Site"
        title={
          <>
            Homepage<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Every field here maps to one live spot on the homepage. Saving publishes immediately; the full page copy lives in Settings."
        actions={
          <a href="/" target="_blank" rel="noreferrer" className="a-btn">
            View homepage
          </a>
        }
      />
      <HomeEditor initial={initial} projects={projects} />
    </div>
  );
}
