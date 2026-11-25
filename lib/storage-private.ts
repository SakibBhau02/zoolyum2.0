import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Private attachment storage (candidate CVs and anything else that must not
 * live behind a public URL).
 *
 * R2 public access is bucket-wide, so a `private/` prefix inside the public
 * bucket is *not* private. Production therefore needs a second bucket with
 * `R2_PRIVATE_BUCKET`; local development writes to `.private-uploads/`, which
 * is outside `public/`. Files are only reachable through the authenticated
 * `/admin/attachment` route.
 */

export type PrivateSavedFile = {
  key: string;
  name: string;
  mime: string;
  size: number;
};

const PRIVATE_R2_PREFIX = "r2private:";
const PRIVATE_LOCAL_PREFIX = "localprivate:";

function safeName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "attachment";
}

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 is not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function privateStorageConfigured(): boolean {
  if (process.env.R2_PRIVATE_BUCKET?.trim()) return true;
  return (process.env.STORAGE_DRIVER ?? "local") !== "r2";
}

export async function savePrivateFile(
  data: Buffer,
  filename: string,
  mime: string,
): Promise<PrivateSavedFile> {
  const name = safeName(filename);
  const key = `careers/${Date.now()}-${randomUUID().slice(0, 8)}-${name}`;
  const bucket = process.env.R2_PRIVATE_BUCKET?.trim();

  if (bucket) {
    const s3 = r2Client();
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: mime,
        ContentDisposition: `attachment; filename="${name}"`,
      }),
    );
    return { key: `${PRIVATE_R2_PREFIX}${key}`, name, mime, size: data.length };
  }

  if ((process.env.STORAGE_DRIVER ?? "local") === "r2") {
    // Fail closed: writing CVs to the public R2 bucket is not acceptable.
    throw new Error(
      "Private attachment storage is not configured. Set R2_PRIVATE_BUCKET to a bucket without public access.",
    );
  }

  const dir = join(process.cwd(), ".private-uploads", "careers");
  await mkdir(dir, { recursive: true });
  const localName = key.replace(/^careers\//, "");
  await writeFile(join(dir, localName), data);
  return { key: `${PRIVATE_LOCAL_PREFIX}${key}`, name, mime, size: data.length };
}

export type PrivateReadResult = {
  stream: ReadableStream<Uint8Array> | Uint8Array;
  mime: string;
  name: string;
};

export async function readPrivateFile(key: string): Promise<PrivateReadResult | null> {
  if (key.startsWith(PRIVATE_R2_PREFIX)) {
    const bucket = process.env.R2_PRIVATE_BUCKET?.trim();
    if (!bucket) return null;
    const objectKey = key.slice(PRIVATE_R2_PREFIX.length);
    const s3 = r2Client();
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }));
    if (!res.Body) return null;
    const name = objectKey.split("/").pop() ?? "attachment";
    return {
      stream: res.Body.transformToWebStream() as ReadableStream<Uint8Array>,
      mime: res.ContentType ?? "application/octet-stream",
      name,
    };
  }

  if (key.startsWith(PRIVATE_LOCAL_PREFIX)) {
    const objectKey = key.slice(PRIVATE_LOCAL_PREFIX.length);
    if (!objectKey.startsWith("careers/") || objectKey.includes("..")) return null;
    const path = join(process.cwd(), ".private-uploads", objectKey);
    try {
      const buf = await readFile(path);
      return { stream: buf, mime: "application/octet-stream", name: objectKey.split("/").pop() ?? "attachment" };
    } catch {
      return null;
    }
  }

  return null;
}

export async function deletePrivateFile(key: string): Promise<void> {
  try {
    if (key.startsWith(PRIVATE_R2_PREFIX)) {
      const bucket = process.env.R2_PRIVATE_BUCKET?.trim();
      if (!bucket) return;
      const s3 = r2Client();
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key.slice(PRIVATE_R2_PREFIX.length) }));
      return;
    }
    if (key.startsWith(PRIVATE_LOCAL_PREFIX)) {
      const objectKey = key.slice(PRIVATE_LOCAL_PREFIX.length);
      if (!objectKey.startsWith("careers/") || objectKey.includes("..")) return;
      await unlink(join(process.cwd(), ".private-uploads", objectKey));
    }
  } catch {
    /* deleting a missing attachment must not fail the lead flow */
  }
}
