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
const MAX_BYTES = 5 * 1024 * 1024;

export function validateUpload(mime: string, size: number) {
  if (!ALLOWED.has(mime)) throw new Error(`Unsupported file type: ${mime}`);
  if (size > MAX_BYTES) throw new Error("File is larger than 5 MB");
}

export async function saveFile(data: Buffer, filename: string, mime: string): Promise<SavedFile> {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver !== "local") throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  return saveLocal(data, filename, mime);
}

export async function removeFile(key: string) {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver !== "local") throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  return removeLocal(key);
}