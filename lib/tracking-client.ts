/**
 * Browser-side lead context with shared event_id for Meta dedupe.
 * Flow: newLeadContext() -> createLead(kind, fields, ctx) ->
 * on ok: fireBrowserLead(kind, ctx).
 * The server sends CAPI `event_id` = ctx.event_id and the browser sends fbq
 * `eventID` = the same value, so Meta counts one Lead.
 *
 * First-touch attribution is stored in sessionStorage: the landing page, the
 * external referrer, UTM parameters and click IDs survive navigation, so the
 * lead carries the campaign that actually produced it.
 */

export type LeadContext = {
  event_id: string;
  event_source_url: string;
  fbp: string;
  fbc: string;
  client_id: string;
  gclid: string;
  fbclid: string;
  msclkid: string;
  landing_page: string;
  referrer: string;
  utm: Record<string, string>;
};

const TOUCH_KEY = "zy_first_touch";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

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

type FirstTouch = {
  landing_page: string;
  referrer: string;
  utm: Record<string, string>;
  gclid: string;
  fbclid: string;
  msclkid: string;
};

function readParams(): { utm: Record<string, string>; gclid: string; fbclid: string; msclkid: string } {
  const utm: Record<string, string> = {};
  if (typeof window === "undefined") return { utm, gclid: "", fbclid: "", msclkid: "" };
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key.replace("utm_", "")] = value;
  }
  return {
    utm,
    gclid: params.get("gclid") ?? "",
    fbclid: params.get("fbclid") ?? "",
    msclkid: params.get("msclkid") ?? "",
  };
}

function firstTouch(): FirstTouch {
  const current = readParams();
  const fallback: FirstTouch = {
    landing_page: typeof window !== "undefined" ? window.location.pathname : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    utm: current.utm,
    gclid: current.gclid,
    fbclid: current.fbclid,
    msclkid: current.msclkid,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const stored = sessionStorage.getItem(TOUCH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as FirstTouch;
      // A later click ID should win, because it is the most recent ad click.
      return {
        ...parsed,
        gclid: current.gclid || parsed.gclid,
        fbclid: current.fbclid || parsed.fbclid,
        msclkid: current.msclkid || parsed.msclkid,
      };
    }
    sessionStorage.setItem(TOUCH_KEY, JSON.stringify(fallback));
  } catch {
    /* private mode / quota */
  }
  return fallback;
}

export function newLeadContext(): LeadContext {
  const touch = firstTouch();
  return {
    event_id: newEventId(),
    event_source_url: typeof window !== "undefined" ? window.location.href : "",
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    client_id: gaClientId(),
    gclid: touch.gclid,
    fbclid: touch.fbclid,
    msclkid: touch.msclkid,
    landing_page: touch.landing_page,
    referrer: touch.referrer,
    utm: touch.utm,
  };
}

/** Push to dataLayer/gtag + fbq Lead with a shared eventID. Never throws. */
export function fireBrowserLead(kind: string, ctx?: LeadContext): void {
  try {
    const event_id = ctx?.event_id || newEventId();
    const w = window as unknown as {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      fbq?: (...args: unknown[]) => void;
      __zy_ads?: { id: string; label: string };
    };
    w.dataLayer?.push({
      event: "lead",
      kind,
      event_id,
      utm_source: ctx?.utm?.source,
      utm_medium: ctx?.utm?.medium,
      utm_campaign: ctx?.utm?.campaign,
    });
    w.gtag?.("event", "generate_lead", { kind, event_id });
    // Google Ads conversion, when a conversion label is configured and GA/Ads
    // are loaded directly (with GTM, the container owns this conversion).
    if (w.__zy_ads?.id && w.__zy_ads?.label) {
      w.gtag?.("event", "conversion", {
        send_to: `${w.__zy_ads.id}/${w.__zy_ads.label}`,
        event_id,
        value: 0,
        currency: "BDT",
      });
    }
    w.fbq?.("track", "Lead", { content_name: kind }, { eventID: event_id });
  } catch {
    /* analytics must never break the form */
  }
}
