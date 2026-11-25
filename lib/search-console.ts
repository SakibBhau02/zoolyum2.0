import { createSign } from "node:crypto";
import { SITE_URL } from "./data";

/**
 * Search Console + Bing Webmaster data.
 *
 * Credentials live in environment variables, never in the database:
 *   GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY, GSC_PROPERTY
 *   BING_WEBMASTER_API_KEY, BING_SITE_URL
 *
 * Both providers are optional. When they are missing the admin shows a setup
 * checklist instead of fake numbers.
 */

export type SearchRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchSnapshot = {
  configured: boolean;
  error?: string;
  rows: SearchRow[];
  pages: SearchRow[];
  totals?: { clicks: number; impressions: number; ctr: number; position: number };
};

type CacheEntry = { at: number; value: SearchSnapshot };
const cache = new Map<string, CacheEntry>();
const TTL = 30 * 60 * 1000;

function cached(key: string, loader: () => Promise<SearchSnapshot>): Promise<SearchSnapshot> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.value);
  return loader().then((value) => {
    cache.set(key, { at: Date.now(), value });
    return value;
  });
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

async function googleAccessToken(): Promise<string> {
  const email = process.env.GSC_CLIENT_EMAIL;
  const key = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Search Console credentials are not set.");

  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: iat + 3600,
      iat,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = signer.sign(key).toString("base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${signature}`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Google token request failed (${res.status}).`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Google did not return an access token.");
  return data.access_token;
}

async function gscQuery(
  token: string,
  property: string,
  dimensions: string[],
  startDate: string,
  endDate: string,
): Promise<{ rows: SearchRow[]; totals?: SearchSnapshot["totals"] }> {
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: 25 }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Search Console query failed (${res.status}). ${text.slice(0, 160)}`);
  }
  const data = (await res.json()) as {
    rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
  };
  const rows = (data.rows ?? []).map((r) => ({
    key: r.keys?.[0] ?? "",
    clicks: Math.round(r.clicks ?? 0),
    impressions: Math.round(r.impressions ?? 0),
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
  const totals = rows.reduce(
    (acc, r) => {
      acc.clicks += r.clicks;
      acc.impressions += r.impressions;
      return acc;
    },
    { clicks: 0, impressions: 0 },
  );
  return {
    rows,
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
      position: rows.length > 0 ? rows.reduce((n, r) => n + r.position, 0) / rows.length : 0,
    },
  };
}

export function searchConsoleConfigured(): boolean {
  return Boolean(process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY && process.env.GSC_PROPERTY);
}

export function bingConfigured(): boolean {
  return Boolean(process.env.BING_WEBMASTER_API_KEY);
}

export async function getSearchConsole(days = 28): Promise<SearchSnapshot> {
  if (!searchConsoleConfigured()) return { configured: false, rows: [], pages: [] };
  return cached(`gsc:${days}`, async () => {
    try {
      const token = await googleAccessToken();
      const property = process.env.GSC_PROPERTY as string;
      const end = new Date();
      const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const [queries, pages] = await Promise.all([
        gscQuery(token, property, ["query"], fmt(start), fmt(end)),
        gscQuery(token, property, ["page"], fmt(start), fmt(end)),
      ]);
      return { configured: true, rows: queries.rows, pages: pages.rows, totals: queries.totals };
    } catch (error) {
      return {
        configured: true,
        error: error instanceof Error ? error.message : "Search Console request failed.",
        rows: [],
        pages: [],
      };
    }
  });
}

export async function getBing(days = 28): Promise<SearchSnapshot> {
  const key = process.env.BING_WEBMASTER_API_KEY;
  if (!key) return { configured: false, rows: [], pages: [] };
  return cached(`bing:${days}`, async () => {
    try {
      const site = process.env.BING_SITE_URL || SITE_URL;
      const url = new URL("https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats");
      url.searchParams.set("apikey", key);
      url.searchParams.set("siteUrl", site);
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`Bing request failed (${res.status}).`);
      const data = (await res.json()) as {
        d?: { Query?: string; Clicks?: number; Impressions?: number; AvgClickPosition?: number }[];
      };
      const rows: SearchRow[] = (data.d ?? []).slice(0, 25).map((r) => ({
        key: r.Query ?? "",
        clicks: r.Clicks ?? 0,
        impressions: r.Impressions ?? 0,
        ctr: (r.Impressions ?? 0) > 0 ? (r.Clicks ?? 0) / (r.Impressions ?? 1) : 0,
        position: r.AvgClickPosition ?? 0,
      }));
      const totals = rows.reduce(
        (acc, r) => {
          acc.clicks += r.clicks;
          acc.impressions += r.impressions;
          return acc;
        },
        { clicks: 0, impressions: 0 },
      );
      return {
        configured: true,
        rows,
        pages: [],
        totals: {
          clicks: totals.clicks,
          impressions: totals.impressions,
          ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
          position: rows.length > 0 ? rows.reduce((n, r) => n + r.position, 0) / rows.length : 0,
        },
      };
    } catch (error) {
      return {
        configured: true,
        error: error instanceof Error ? error.message : "Bing request failed.",
        rows: [],
        pages: [],
      };
    }
  });
}
