/** Client-safe text helpers (no node dependencies - safe for Client Components). */

/** Extract an 11-char YouTube video id from a watch / youtu.be / embed / shorts URL or a bare id. */
export function parseYoutubeId(input: string): string {
  const s = (input ?? "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}

export function splitAccent(text: string): [string, string, string] {
  const parts = text.split("|");
  return [parts[0] ?? "", parts[1] ?? "", parts.slice(2).join("|")];
}

/**
 * Clamp a string to a SERP-safe length at a word boundary, without cutting a
 * word in half. Used for meta descriptions built from long CMS copy.
 */
export function clampMeta(input: string, max = 156): string {
  const s = (input ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  const body = (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\-–—]+$/, "");
  return `${body}…`;
}
