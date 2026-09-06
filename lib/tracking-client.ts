/**
 * Browser-side lead context with shared event_id for Meta dedupe.
 * Flow: newLeadContext() -> createLead(kind, fields, ctx) ->
 * on ok: fireBrowserLead(kind, ctx).
 * The server sends CAPI `event_id` = ctx.event_id and the browser
 * sends fbq `eventID` = same value, so Meta counts one Lead.
 */

export type LeadContext = {
  event_id: string;
  event_source_url: string;
  fbp: string;
  fbc: string;
  client_id: string;
};

export function newEventId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  try {
    return m ? decodeURIComponent(m[1]) : "";
  } catch {
    return m ? m[1] : "";
  }
}

function gaClientId(): string {
  const ga = readCookie("_ga");
  const m = ga.match(/GA1\.\d+\.(\d+\.\d+)/);
  if (m) return m[1];
  return `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;
}

export function newLeadContext(): LeadContext {
  return {
    event_id: newEventId(),
    event_source_url: typeof window !== "undefined" ? window.location.href : "",
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    client_id: gaClientId(),
  };
}

/** Push to dataLayer (GTM/GA4) + fbq Lead with shared eventID. Never throws. */
export function fireBrowserLead(kind: string, ctx?: LeadContext): void {
  try {
    const event_id = ctx?.event_id || newEventId();
    (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: "lead", kind, event_id });
    (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.(
      "track",
      "Lead",
      { content_name: kind },
      { eventID: event_id },
    );
  } catch {
    /* analytics must never break the form */
  }
}
