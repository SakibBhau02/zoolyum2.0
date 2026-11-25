/**
 * Minimal in-process rate limiter.
 *
 * Scope: one server instance. On Vercel that means each lambda warms its own
 * map, so a distributed flood can still fan out across instances — it stops
 * the common case (a loop or a naive bot hammering one endpoint) cheaply and
 * without a new dependency. If stronger guarantees are needed later, swap the
 * two functions below for an Upstash/Redis counter; call sites stay identical.
 */

import { prisma } from "./prisma";

type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.reset < now) buckets.delete(key);
  }
}

export type RateResult = { ok: true; remaining: number } | { ok: false; retryAfter: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.reset - now) / 1000)) };
  }
  return { ok: true, remaining: limit - bucket.count };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}

/**
 * Cross-instance limiter backed by Postgres. One atomic upsert per request, so
 * a bot cannot reset its budget by landing on a different Lambda. Falls back
 * to the in-process map when the database is unavailable (availability over
 * strictness: a DB blip must not lock every visitor out of the contact form).
 */
export async function rateLimitShared(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateResult> {
  const now = Date.now();
  const nowDate = new Date(now);
  const resetAt = new Date(now + windowMs);
  try {
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= ${nowDate} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${nowDate} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"
    `;
    const row = rows[0];
    if (!row) return rateLimit(key, limit, windowMs);
    if (row.count <= limit) return { ok: true, remaining: Math.max(0, limit - row.count) };
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((new Date(row.resetAt).getTime() - now) / 1000)),
    };
  } catch {
    return rateLimit(key, limit, windowMs);
  }
}
