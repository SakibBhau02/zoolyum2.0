import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { collectRoutes } from "@/lib/seo-routes";
import { PageHeader } from "../../_ui/primitives";
import { Icon } from "../../_ui/icons";
import { BulkEditor } from "./bulk-editor";

export const dynamic = "force-dynamic";

export default async function SeoBulkPage() {
  await requireUser("editor");
  const rows = await collectRoutes();

  return (
    <div>
      <PageHeader
        eyebrow="Grow"
        title={
          <>
            Bulk snippets<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Edit title tags and meta descriptions across every route in one pass. Only rows you change are written, and each save revalidates the public page."
        actions={
          <>
            <Link href="/admin/seo" className="a-btn">
              <Icon name="arrowLeft" className="h-3.5 w-3.5" /> SEO workspace
            </Link>
            <Link href="/admin/seo/health" className="a-btn">
              Site health
            </Link>
          </>
        }
      />
      <BulkEditor rows={rows} />
    </div>
  );
}
