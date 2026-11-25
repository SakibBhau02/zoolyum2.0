import sharp from "sharp";

/**
 * Normalise every uploaded photo before it reaches storage.
 *
 * - auto-rotate by EXIF and strip metadata
 * - cap the long edge at 2400 px (without upscaling)
 * - encode as WebP q82, which is 25–60% smaller than the source JPEG/PNG
 *
 * SVG is vector and stays untouched. Failures fall back to the original file
 * so an upload never breaks because of an odd image.
 */
const MAX_EDGE = 2400;
const QUALITY = 82;

export type ProcessedImage = {
  buffer: Buffer;
  mime: string;
  filename: string;
  width: number;
  height: number;
  bytesSaved: number;
};

export async function processImage(
  input: Buffer,
  mime: string,
  filename: string,
): Promise<ProcessedImage | null> {
  if (!mime.startsWith("image/") || mime === "image/svg+xml") return null;
  try {
    const pipeline = sharp(input, { failOn: "none" }).rotate();
    const result = await pipeline
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    const base = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_") || "image";
    return {
      buffer: result.data,
      mime: "image/webp",
      filename: `${base}.webp`,
      width: result.info.width,
      height: result.info.height,
      bytesSaved: Math.max(0, input.length - result.data.length),
    };
  } catch (error) {
    console.warn("[image] conversion failed, keeping original", error);
    return null;
  }
}
