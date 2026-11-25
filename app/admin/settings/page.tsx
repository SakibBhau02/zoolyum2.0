import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "../_ui/primitives";
import { buildGroups } from "./registry";
import { SettingsForm } from "./form";

const KNOWN_EXTRA = ["analytics.indexnow_key", "seo.google_verification"];

export default async function SettingsPage() {
  await requireUser("admin");
  const rows: { key: string; value: string }[] = await prisma.siteSetting
    .findMany({ orderBy: { key: "asc" }, select: { key: true, value: true } })
    .catch(() => []);
  // Known keys that are not yet in the table still need an input, otherwise a
  // new integration (IndexNow, verification tokens) can never be configured.
  for (const key of KNOWN_EXTRA) {
    if (!rows.some((r) => r.key === key)) rows.push({ key, value: "" });
  }
  rows.sort((a, b) => a.key.localeCompare(b.key));
  const groups = buildGroups(rows);
  return (
    <div>
      <PageHeader
        eyebrow="Site"
        title={
          <>
            Settings<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Page metadata, contact details, social profiles and analytics. Grouped by what you are trying to change, not by database key."
      />
      <SettingsForm groups={groups} />
    </div>
  );
}
