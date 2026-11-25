import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma singleton.
 *
 * Connection comes from DATABASE_URL only, so moving between local Docker,
 * Neon and any other Postgres is a one-variable change.
 *
 * Pooling: serverless functions each keep a small pool. On Neon use the
 * `-pooler` host so PgBouncer multiplexes them; `PG_POOL_MAX` caps the pool per
 * instance (default 10). Keep the total under the database's connection limit:
 * instances × PG_POOL_MAX.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

// Cache in every environment: dev keeps the hot-reload connection, and in
// serverless the module scope survives between invocations on a warm instance.
globalForPrisma.prisma = prisma;
