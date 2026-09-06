import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import type { SavedFile } from "./storage";

/** Cloudflare R2 driver (S3-compatible). Needs R2_* env vars. */

function client() {
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 is not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).");
  }
  return {
    s3: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    }),
    bucket: process.env.R2_BUCKET ?? "",
  };
}

function publicUrl(key: string) {
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (base) return `${base}/${key}`;
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const bucket = process.env.R2_BUCKET ?? "";
  return `https://pub-${accountId}.r2.dev/${key}`;
}

export async function saveR2(data: Buffer, filename: string, mime: string): Promise<SavedFile> {
  const { s3, bucket } = client();
  if (!bucket) throw new Error("R2_BUCKET is not set.");
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${Date.now()}-${randomUUID().slice(0, 8)}-${safe}`;
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: mime }));
  return { key: `r2:${key}`, url: publicUrl(key), mime, size: data.length };
}

export async function removeR2(key: string): Promise<void> {
  if (!key.startsWith("r2:")) return;
  const { s3, bucket } = client();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key.slice(3) }));
}
