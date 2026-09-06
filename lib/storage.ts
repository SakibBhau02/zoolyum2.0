import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, basename } from "node:path";
import { randomUUID } from "node:crypto";

export type SavedFile = {
  key: string;
  url: string;
  mime: string;
  size: number;
};

/**
 * Storage driver interface. Local driver writes to public/uploads
 * (gitignored). A GCS driver later implements the same two methods
 * behind STORAGE_DRIVER - no call-site changes.
 */
async function saveLocal(data: Buffer, filename: string, mime: string): Promise<SavedFile> {
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const safe = basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `uploads/${Date.now()}-${randomUUID().slice(0, 8)}-${safe}`;
  await writeFile(join(process.cwd(), "public", key), data);
  return { key, url: `/${key}`, mime, size: data.length };
}

async function removeLocal(key: string) {
  if (!key.startsWith("uploads/")) return;
  try {
    await unlink(join(process.cwd(), "public", key));
  } catch {
    /* already gone */
  }
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const ALLOWED_DOCS = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DOC_BYTES = 10 * 1024 * 1024;

export function validateUpload(mime: string, size: number, docs = false) {
  const allowed = docs ? new Set([...ALLOWED, ...ALLOWED_DOCS]) : ALLOWED;
  const max = docs ? MAX_DOC_BYTES : MAX_BYTES;
  if (!allowed.has(mime)) throw new Error(`Unsupported file type: ${mime}`);
  if (size > max) throw new Error(`File is larger than ${Math.round(max / 1024 / 1024)} MB`);
}

export async function saveFile(data: Buffer, filename: string, mime: string): Promise<SavedFile> {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "r2") {
    const { saveR2 } = await import("./storage-r2");
    return saveR2(data, filename, mime);
  }
  if (driver !== "local") throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  return saveLocal(data, filename, mime);
}

export async function removeFile(key: string) {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (key.startsWith("r2:")) {
    const { removeR2 } = await import("./storage-r2");
    return removeR2(key);
  }
  if (driver !== "local") throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  return removeLocal(key);
}