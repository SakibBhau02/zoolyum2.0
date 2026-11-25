/**
 * Reset an admin password without the UI (recovery path).
 *
 * Usage:
 *   npm run db:reset-admin -- --email owner@zoolyum.com --password "new long password"
 *
 * Creates an owner if the email does not exist. Revokes every existing session
 * for that user so a lost device cannot keep access.
 */
import "dotenv/config";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEYLEN, {
    N,
    r: R,
    p: P,
    maxmem: 128 * N * R * 2,
  });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

function arg(name: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? (process.argv[index + 1] ?? "").trim() : "";
}

async function main() {
  const email = (arg("email") || process.env.ADMIN_EMAIL || "").toLowerCase();
  const password = arg("password") || process.env.ADMIN_PASSWORD || "";
  if (!email.includes("@")) {
    throw new Error("Pass --email owner@example.com");
  }
  if (password.length < 10) {
    throw new Error("Pass a password of at least 10 characters with --password.");
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    connectionTimeoutMillis: 10_000,
  });
  const prisma = new PrismaClient({ adapter });
  try {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    const passwordHash = await hashPassword(password);
    const user = existing
      ? await prisma.adminUser.update({
          where: { id: existing.id },
          data: { passwordHash, failedLogins: 0, lockedUntil: null, active: true },
        })
      : await prisma.adminUser.create({
          data: { email, name: email.split("@")[0], passwordHash, role: "owner" },
        });
    const revoked = await prisma.adminSession.deleteMany({ where: { userId: user.id } });
    console.log(`Password updated for ${user.email} (role: ${user.role}); ${revoked.count} session(s) revoked.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
