import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, basename } from "node:path";
import { randomUUID } from "node:crypto";
import { processImage } from "./image";

export type SavedFile = {
  key: string;
  url: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  /** True when the upload was re-encoded to WebP. */
  converted?: boolean;
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
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DOC_BYTES = 10 * 1024 * 1024;

/**
 * Detect a file's real type from its first bytes instead of trusting the
 * browser-supplied MIME string. Uploads with an unknown signature are
 * rejected outright, which closes the “rename an .exe to .png” hole.
 */
export function sniffMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  const hex = buf.subarray(0, 12).toString("hex");

  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e470d0a1a0a")) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  if (hex.startsWith("25504446")) return "application/pdf"; // %PDF
  if (hex.startsWith("504b0304")) return "application/zip"; // docx / zip container
  if (hex.startsWith("d0cf11e0")) return "application/msword"; // legacy .doc

  // SVG is text: allow an XML prolog or a root <svg>, and nothing else.
  const head = buf.subarray(0, 512).toString("utf8").replace(/^\uFEFF/, "").trimStart().toLowerCase();
  if (head.startsWith("<?xml") || head.startsWith("<svg") || head.startsWith("<!--")) {
    return head.includes("<svg") || head.includes("<?xml") ? "image/svg+xml" : null;
  }

  return null;
}

export function validateUpload(mime: string, size: number, docs = false) {
  const allowed = docs ? new Set([...ALLOWED, ...ALLOWED_DOCS]) : ALLOWED;
  const max = docs ? MAX_DOC_BYTES : MAX_BYTES;
  if (!allowed.has(mime)) throw new Error(`Unsupported file type: ${mime}`);
  if (size > max) throw new Error(`File is larger than ${Math.round(max / 1024 / 1024)} MB`);
}

export async function saveFile(data: Buffer, filename: string, mime: string): Promise<SavedFile> {
  // Re-encode photos to WebP before they reach local disk or R2. SVG and
  // documents pass straight through.
  const processed = await processImage(data, mime, filename);
  const payload = processed?.buffer ?? data;
  const finalMime = processed?.mime ?? mime;
  const finalName = processed?.filename ?? filename;

  const driver = process.env.STORAGE_DRIVER ?? "local";
  let saved: SavedFile;
  if (driver === "r2") {
    const { saveR2 } = await import("./storage-r2");
    saved = await saveR2(payload, finalName, finalMime);
  } else if (driver === "local") {
    saved = await saveLocal(payload, finalName, finalMime);
  } else {
    throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  }

  return {
    ...saved,
    width: processed?.width,
    height: processed?.height,
    converted: Boolean(processed),
  };
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