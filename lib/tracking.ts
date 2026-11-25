import { createHash, randomUUID } from "node:crypto";
import { prisma } from "./prisma";

/**
 * Server-only tracking config + senders.
 *
 * IDs are admin-editable (SiteSetting); secrets stay server-only — never
 * import this module from a client component.
 *
 * Meta CAPI dedupe: browser Pixel sends `eventID`, server sends the same
 * string as `event_id` with matching `event_name` ("Lead"). Meta keeps the
 * first arrival within 48h and drops the duplicate.
 *
 * GA4 MP augments (never replaces) gtag: the same `client_id` joins the server
 * event to the browser session.
 *
 * Every attempt is written to `TrackingEvent`, which powers the admin status
 * page and makes silent breakage visible.
 */

export type TrackingConfig = {
  ga4Id: string;
  gtmId: string;
  clarityId: string;
  pixelId: string;
  metaCapiToken: string;
  metaTestEventCode: string;
  ga4ApiSecret: string;
  googleAdsId: string;
  googleAdsLabel: string;
  serverEnabled: boolean;
  consentMode: boolean;
};

export type Attribution = {
  landingPage?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  utm?: Record<string, string>;
};

async function setting(key: string): Promise<string> {
  try {
    const s = await prisma.siteSetting.findUnique({ where: { key } });
    return s?.value.trim() ?? "";
  } catch {
    return "";
  }
}

export async function getTrackingConfig(): Promise<TrackingConfig> {
  const [
    ga4Id,
    gtmId,
    clarityId,
    pixelId,
    metaToken,
    metaTest,
    ga4Secret,
    googleAdsId,
    googleAdsLabel,
    serverFlag,
    consentFlag,
  ] = await Promise.all([
    setting("analytics.ga4_id"),
    setting("analytics.gtm_id"),
    setting("analytics.clarity_id"),
    setting("analytics.pixel_id"),
    setting("analytics.meta_capi_token"),
    setting("analytics.meta_test_event_code"),
    setting("analytics.ga4_api_secret"),
    setting("analytics.google_ads_id"),
    setting("analytics.google_ads_label"),
    setting("analytics.server_tracking_enabled"),
    setting("analytics.consent_mode"),
  ]);
  return {
    ga4Id,
    gtmId,
    clarityId,
    pixelId,
    metaCapiToken: metaToken || process.env.META_CAPI_TOKEN?.trim() || "",
    metaTestEventCode: metaTest || process.env.META_TEST_EVENT_CODE?.trim() || "",
    ga4ApiSecret: ga4Secret || process.env.GA4_API_SECRET?.trim() || "",
    googleAdsId,
    googleAdsLabel,
    serverEnabled: (serverFlag || "true").toLowerCase() !== "false",
    consentMode: consentFlag.toLowerCase() === "on",
  };
}

export function sha256Hex(v: string): string {
  return createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

/** Extract GA client_id from the _ga cookie (GA1.2.xxx.yyy) or mint one. */
export function gaClientIdFromCookie(cookieHeader: string | null): string {
  if (cookieHeader) {
    const m = cookieHeader.match(/(?:^|;\s*)_ga=GA1\.\d+\.(\d+\.\d+)/);
    if (m) return m[1];
  }
  return `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;
}

export function newServerEventId(): string {
  try {
    return randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
  }
}

/* ------------------------------- event log ------------------------------ */

type EventKind = "lead" | "test";

async function record(
  provider: "meta" | "ga4",
  eventName: string,
  status: "ok" | "error" | "skipped",
  detail: string | null,
  kind: EventKind = "lead",
  leadId?: number,
): Promise<void> {
  try {
    await prisma.trackingEvent.create({
      data: {
        kind,
        provider,
        eventName,
        status,
        detail: detail ? detail.slice(0, 500) : null,
        leadId: leadId ?? null,
      },
    });
  } catch {
    /* the log must never break the send */
  }
}

/* -------------------------------- senders ------------------------------- */

export type LeadServerInput = {
  kind: string;
  email: string;
  eventId: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  clientId?: string;
  ip?: string;
  userAgent?: string;
  attribution?: Attribution;
  leadId?: number;
};

type SendResult = { status: "ok" | "error" | "skipped"; detail: string | null };

function attributionData(a?: Attribution): Record<string, string> {
  if (!a) return {};
  const out: Record<string, string> = {};
  if (a.landingPage) out.landing_page = a.landingPage;
  if (a.referrer) out.referrer = a.referrer;
  if (a.gclid) out.gclid = a.gclid;
  if (a.fbclid) out.fbclid = a.fbclid;
  if (a.msclkid) out.msclkid = a.msclkid;
  for (const [key, value] of Object.entries(a.utm ?? {})) {
    if (value) out[`utm_${key}`] = value;
  }
  return out;
}

async function sendMetaLead(cfg: TrackingConfig, o: LeadServerInput): Promise<SendResult> {
  if (!cfg.pixelId || !cfg.metaCapiToken) {
    return { status: "skipped", detail: "Pixel ID or CAPI token is missing." };
  }
  const user_data: Record<string, string> = {};
  if (o.email.includes("@")) user_data.em = sha256Hex(o.email);
  if (o.ip) user_data.client_ip_address = o.ip;
  if (o.userAgent) user_data.client_user_agent = o.userAgent;
  if (o.fbp) user_data.fbp = o.fbp;
  if (o.fbc) user_data.fbc = o.fbc;
  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: o.eventId,
        action_source: "website",
        ...(o.eventSourceUrl ? { event_source_url: o.eventSourceUrl } : {}),
        user_data,
        custom_data: { content_name: o.kind, ...attributionData(o.attribution) },
      },
    ],
  };
  if (cfg.metaTestEventCode) body.test_event_code = cfg.metaTestEventCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(cfg.pixelId)}/events?access_token=${encodeURIComponent(cfg.metaCapiToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      const text = (await res.text()).slice(0, 400);
      return { status: "error", detail: `${res.status}: ${text}` };
    }
    return { status: "ok", detail: null };
  } catch (error) {
    return { status: "error", detail: error instanceof Error ? error.message : "Network error" };
  }
}

async function sendGa4Lead(cfg: TrackingConfig, o: LeadServerInput): Promise<SendResult> {
  if (!cfg.ga4Id || !cfg.ga4ApiSecret) {
    return { status: "skipped", detail: "GA4 ID or Measurement Protocol secret is missing." };
  }
  const client_id = o.clientId || `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;
  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(cfg.ga4Id)}&api_secret=${encodeURIComponent(cfg.ga4ApiSecret)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id,
          events: [
            {
              name: "generate_lead",
              params: { kind: o.kind, event_id: o.eventId, ...attributionData(o.attribution) },
            },
          ],
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok && res.status !== 204) {
      const text = (await res.text()).slice(0, 400);
      return { status: "error", detail: `${res.status}: ${text}` };
    }
    return { status: "ok", detail: null };
  } catch (error) {
    return { status: "error", detail: error instanceof Error ? error.message : "Network error" };
  }
}

/** Fire server Lead events and log every attempt. Never throws. */
export async function trackServerLead(o: LeadServerInput): Promise<void> {
  try {
    const cfg = await getTrackingConfig();
    if (!cfg.serverEnabled) {
      await Promise.all([
        record("meta", "Lead", "skipped", "Server tracking disabled", "lead", o.leadId),
        record("ga4", "generate_lead", "skipped", "Server tracking disabled", "lead", o.leadId),
      ]);
      return;
    }
    const [meta, ga4] = await Promise.all([sendMetaLead(cfg, o), sendGa4Lead(cfg, o)]);
    await Promise.all([
      record("meta", "Lead", meta.status, meta.detail, "lead", o.leadId),
      record("ga4", "generate_lead", ga4.status, ga4.detail, "lead", o.leadId),
    ]);
  } catch (e) {
    console.warn("[tracking] server lead failed", e);
  }
}

/** Admin-initiated test send. Returns the raw result so the UI can show it. */
export async function sendTestEvent(provider: "meta" | "ga4"): Promise<{ ok: boolean; detail: string }> {
  const cfg = await getTrackingConfig();
  const input: LeadServerInput = {
    kind: "test",
    email: "qa@zoolyum.com",
    eventId: newServerEventId(),
    eventSourceUrl: "https://www.zoolyum.com/",
    attribution: { landingPage: "/admin/tracking", utm: { source: "admin-test" } },
  };
  const result = provider === "meta" ? await sendMetaLead(cfg, input) : await sendGa4Lead(cfg, input);
  await record(provider, provider === "meta" ? "Lead" : "generate_lead", result.status, result.detail, "test");
  return { ok: result.status === "ok", detail: result.detail ?? (result.status === "skipped" ? "Not configured." : "Sent.") };
}
