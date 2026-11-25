import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Daily retention job (Vercel Cron). Disabled unless CRON_SECRET is set; the
 * scheduler sends `Authorization: Bearer <CRON_SECRET>` automatically.
 *
 * `npm run db:prune` runs the same SQL from a shell.
 */
export const dynamic = "force-dynamic";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return new Response("Not configured", { status: 404 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const days = Number(process.env.RETENTION_DAYS ?? 180);
  const now = new Date();
  const [sessions, limits, notFound, tracking, revisions] = await Promise.all([
    prisma.adminSession.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => ({ count: 0 })),
    prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => ({ count: 0 })),
    prisma.notFoundLog.deleteMany({ where: { lastSeenAt: { lt: daysAgo(days) } } }).catch(() => ({ count: 0 })),
    prisma.trackingEvent.deleteMany({ where: { createdAt: { lt: daysAgo(90) } } }).catch(() => ({ count: 0 })),
    prisma.revision.deleteMany({ where: { createdAt: { lt: daysAgo(days) } } }).catch(() => ({ count: 0 })),
  ]);

  return Response.json({
    ok: true,
    sessions: sessions.count,
    rateLimits: limits.count,
    notFound: notFound.count,
    trackingEvents: tracking.count,
    revisions: revisions.count,
  });
}
