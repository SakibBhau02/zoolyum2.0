/**
 * Retention job. Run daily from Vercel Cron (or any scheduler):
 *   npm run db:prune
 *
 * Keeps the operational tables bounded. Content, leads and audit history are
 * never touched here; only expired sessions, rate-limit rows, old 404 logs,
 * tracking attempts and old revisions.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DAYS = Number(process.env.RETENTION_DAYS ?? 180);

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 });
  const prisma = new PrismaClient({ adapter });
  try {
    const now = new Date();
    const [sessions, limits, notFound, tracking, revisions] = await Promise.all([
      prisma.adminSession.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }),
      prisma.notFoundLog.deleteMany({ where: { lastSeenAt: { lt: daysAgo(DAYS) } } }),
      prisma.trackingEvent.deleteMany({ where: { createdAt: { lt: daysAgo(90) } } }),
      prisma.revision.deleteMany({ where: { createdAt: { lt: daysAgo(DAYS) } } }),
    ]);
    console.log(
      JSON.stringify({
        sessions: sessions.count,
        rateLimits: limits.count,
        notFound: notFound.count,
        trackingEvents: tracking.count,
        revisions: revisions.count,
        retentionDays: DAYS,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
