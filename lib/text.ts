/** Client-safe text helpers (no node dependencies - safe for Client Components). */

export function splitAccent(text: string): [string, string, string] {
  const parts = text.split("|");
  return [parts[0] ?? "", parts[1] ?? "", parts.slice(2).join("|")];
}
