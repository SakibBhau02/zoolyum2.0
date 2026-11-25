/**
 * One-off migration: move legacy public CVs out of the public R2 bucket.
 *
 *   npm run db:privatize-leads            # dry run
 *   npm run db:privatize-leads -- --apply # copy to private bucket + update lead + delete public object
 *
 * Requires R2_PRIVATE_BUCKET. Old objects are deleted only after the private
 * copy succeeds; a failure leaves the lead untouched so it can be retried.
 */
import "dotenv/config";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { savePrivateFile } from "../lib/storage-private";

const apply = process.argv.includes("--apply");

function publicS3() {
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
}

type Attachment = { field: string; key: string; name: string; mime: string; size: number };

async function main() {
  if (!process.env.R2_PRIVATE_BUCKET?.trim()) {
    throw new Error("Set R2_PRIVATE_BUCKET before running this script.");
  }
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 });
  const prisma = new PrismaClient({ adapter });
  try {
    const leads = await prisma.lead.findMany({
      where: { kind: "careers" },
      select: { id: true, payload: true },
    });
    let moved = 0;
    for (const lead of leads) {
      const payload = (lead.payload ?? {}) as Record<string, unknown>;
      if (Array.isArray(payload.__attachments)) continue;
      const url = typeof payload.resume === "string" && /^https?:\/\//i.test(payload.resume) ? payload.resume : "";
      if (!url) continue;
      console.log(`lead #${lead.id}: ${url}`);
      if (!apply) continue;

      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  skip: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const mime = res.headers.get("content-type")?.split(";")[0] || "application/pdf";
      const saved = await savePrivateFile(buffer, decodeURIComponent(url.split("/").pop() ?? "resume.pdf"), mime);
      const migrated: Attachment = { field: "resume", ...saved };

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          payload: {
            ...payload,
            resume: saved.name,
            __attachments: [migrated],
          } as object,
        },
      });

      // Best effort: remove the public object only after the DB points at the
      // private copy.
      try {
        const key = new URL(url).pathname.replace(/^\/+/, "");
        if (key.startsWith("uploads/")) {
          await publicS3().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
          // The old media-library row pointed at the public object; it would
          // now be a broken thumbnail in the admin.
          await prisma.media.deleteMany({ where: { key: `r2:${key}` } });
        }
      } catch (error) {
        console.warn(`  private copy saved, public delete failed: ${error instanceof Error ? error.message : error}`);
      }
      moved += 1;
    }
    console.log(apply ? `Moved ${moved} attachment(s).` : "Dry run — pass --apply to migrate.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
