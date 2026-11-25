import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { COLLECTIONS, type CollectionKey } from "../../../config";
import { Breadcrumbs, Card, EmptyState, PageHeader } from "../../../_ui/primitives";
import { shortDate } from "../../../_ui/format";
import { RestoreButton } from "./history-client";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  await requireUser("editor");
  const { collection, id } = await params;
  if (!(collection in COLLECTIONS) || !Number(id)) notFound();
  const key = collection as CollectionKey;
  const def = COLLECTIONS[key];

  const revisions = await prisma.revision
    .findMany({
      where: { collection: key, recordId: Number(id) },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        label: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true } },
        snapshot: true,
      },
    })
    .catch(() => []);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: def.label, href: `/admin/${key}` },
          { label: `#${id}`, href: `/admin/${key}/${id}` },
          { label: "History" },
        ]}
      />
      <PageHeader
        eyebrow="Version history"
        title={
          <>
            {def.singular} history<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Every save writes a snapshot. Restoring an older version creates a new save, so nothing is lost."
        actions={
          <Link href={`/admin/${key}/${id}`} className="a-btn">
            Back to editor
          </Link>
        }
      />

      {revisions.length === 0 ? (
        <EmptyState title="No versions yet" description="Save the item once and the first snapshot appears here." />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-[var(--a-line)]">
            {revisions.map((rev, index) => {
              const snapshot = rev.snapshot as Record<string, unknown>;
              const title = String(snapshot.title ?? snapshot[def.slugField] ?? `#${id}`);
              return (
                <li key={rev.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="a-badge">{index === 0 ? "latest" : `v${revisions.length - index}`}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px]">{title}</p>
                    <p className="a-faint text-[10.5px]">
                      {shortDate(rev.createdAt)}{" "}
                      {rev.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                      {rev.user?.name ?? "System"}
                      {rev.label ? ` · ${rev.label}` : ""}
                    </p>
                  </div>
                  {index !== 0 && (
                    <RestoreButton revisionId={rev.id} collection={key} recordId={Number(id)} />
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
