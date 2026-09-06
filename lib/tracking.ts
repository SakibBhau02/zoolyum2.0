import { createHash, randomUUID } from "node:crypto";
import { prisma } from "./prisma";

/**
 * Server-only tracking config + senders.
 * IDs are admin-editable (SiteSetting); secrets stay server-only —
 * never import this module from a client component.
 *
 * Meta CAPI dedupe: browser Pixel sends `eventID`, server sends the
 * same string as `event_id` with matching `event_name` ("Lead").
 * Meta keeps the first arrival within 48h and drops the duplicate.
 *
 * GA4 MP augments (never replaces) gtag: same `client_id` joins the
 * server `generate_lead` to the browser session.
 */

export type TrackingConfig = {
  ga4Id: string;
  gtmId: string;
  clarityId: string;
  pixelId: string;
  metaCapiToken: string;
  metaTestEventCode: string;
  ga4ApiSecret: string;
  serverEnabled: boolean;
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
  const [ga4Id, gtmId, clarityId, pixelId, metaToken, metaTest, ga4Secret, serverFlag] =
    await Promise.all([
      setting("analytics.ga4_id"),
      setting("analytics.gtm_id"),
      setting("analytics.clarity_id"),
      setting("analytics.pixel_id"),
      setting("analytics.meta_capi_token"),
      setting("analytics.meta_test_event_code"),
      setting("analytics.ga4_api_secret"),
      setting("analytics.server_tracking_enabled"),
    ]);
  return {
    ga4Id,
    gtmId,
    clarityId,
    pixelId,
    metaCapiToken: metaToken || process.env.META_CAPI_TOKEN?.trim() || "",
    metaTestEventCode: metaTest || process.env.META_TEST_EVENT_CODE?.trim() || "",
    ga4ApiSecret: ga4Secret || process.env.GA4_API_SECRET?.trim() || "",
    serverEnabled: (serverFlag || "true").toLowerCase() !== "false",
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

type LeadServerOpts = {
  kind: string;
  email: string;
  eventId: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  clientId?: string;
  ip?: string;
  userAgent?: string;
};

async function sendMetaLead(cfg: TrackingConfig, o: LeadServerOpts): Promise<void> {
  if (!cfg.pixelId || !cfg.metaCapiToken) return;
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
        custom_data: { content_name: o.kind },
      },
    ],
  };
  if (cfg.metaTestEventCode) body.test_event_code = cfg.metaTestEventCode;
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(cfg.pixelId)}/events?access_token=${encodeURIComponent(cfg.metaCapiToken)}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!res.ok) console.warn("[tracking] Meta CAPI failed", res.status, (await res.text()).slice(0, 300));
}

async function sendGa4Lead(cfg: TrackingConfig, o: LeadServerOpts): Promise<void> {
  if (!cfg.ga4Id || !cfg.ga4ApiSecret) return;
  const client_id = o.clientId || `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;
  const res = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(cfg.ga4Id)}&api_secret=${encodeURIComponent(cfg.ga4ApiSecret)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id,
        events: [{ name: "generate_lead", params: { kind: o.kind, event_id: o.eventId } }],
      }),
    },
  );
  if (!res.ok && res.status !== 204)
    console.warn("[tracking] GA4 MP failed", res.status, (await res.text()).slice(0, 300));
}

/** Fire server Lead events. Never throws — analytics must never break forms. */
export async function trackServerLead(o: LeadServerOpts): Promise<void> {
  try {
    const cfg = await getTrackingConfig();
    if (!cfg.serverEnabled) return;
    await Promise.allSettled([sendMetaLead(cfg, o), sendGa4Lead(cfg, o)]);
  } catch (e) {
    console.warn("[tracking] server lead failed", e);
  }
}
