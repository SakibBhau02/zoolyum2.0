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
