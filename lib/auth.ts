import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

/**
 * Admin identity.
 *
 * - Passwords: scrypt with a per-user salt, stored as
 *   `scrypt$N$r$p$salt$hash`.
 * - Sessions: a random 256-bit token in an httpOnly cookie; only its SHA-256
 *   hash is stored in Postgres, so a database leak cannot replay sessions.
 * - Authorization is enforced in the layout/pages/actions, not in proxy.ts
 *   (Next 16 docs: proxy is an optimistic check, not a session solution).
 */

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem?: number },
) => Promise<Buffer>;

export const SESSION_COOKIE = "zy_admin";
const SESSION_DAYS = 7;
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export type Role = "owner" | "admin" | "editor" | "viewer";

const RANK: Record<Role, number> = { viewer: 1, editor: 2, admin: 3, owner: 4 };

export function asRole(value: string): Role {
  return value === "owner" || value === "admin" || value === "editor" ? value : "viewer";
}

export function can(role: string, min: Role): boolean {
  return RANK[asRole(role)] >= RANK[min];
}

/* ------------------------------ passwords ------------------------------ */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEYLEN, {
    N,
    r: R,
    p: P,
    maxmem: 128 * N * R * 2,
  });
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, n, r, p, saltHex, hashHex] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: 128 * Number(n) * Number(r) * 2,
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/* ------------------------------- sessions ------------------------------ */

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
};

export type SessionUser = AdminUser & { sessionId: string };

/**
 * Per-request memoised session lookup. Safe in server components, layouts and
 * server actions — React dedupes the call inside one request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: tokenHash(token) },
      select: {
        id: true,
        expiresAt: true,
        user: { select: { id: true, email: true, name: true, role: true, active: true } },
      },
    });
    if (!session || session.expiresAt.getTime() <= Date.now() || !session.user.active) return null;
    return { ...session.user, sessionId: session.id };
  } catch {
    return null;
  }
});

export async function requireUser(min: Role = "viewer"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const h = await headers();
    const next = h.get("x-pathname") ?? "/admin";
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }
  if (!can(user.role, min)) redirect("/admin?denied=1");
  return user;
}

/** For server actions: never redirects, returns a typed error instead. */
export async function actionUser(min: Role = "editor"): Promise<
  { ok: true; user: SessionUser } | { ok: false; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Your session expired. Sign in again." };
  if (!can(user.role, min)) return { ok: false, error: "You do not have permission for this action." };
  return { ok: true, user };
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.adminSession.create({
    data: {
      userId,
      tokenHash: tokenHash(token),
      expiresAt,
      ip,
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: tokenHash(token) } }).catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { userId } });
}

/* -------------------------------- login -------------------------------- */

export type LoginResult = { ok: true; role: string } | { ok: false; error: string };

/**
 * Email + password login with a DB-backed lockout, so brute force is rate
 * limited across every serverless instance (the old in-memory limiter was not).
 *
 * Bootstrap: while no AdminUser exists, the first successful login using
 * ADMIN_PASSWORD creates the owner. That keeps the current env working without
 * a manual seed step.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const normalised = email.trim().toLowerCase();
  if (!normalised || !password) return { ok: false, error: "Email and password are required." };

  void pruneSessions();

  const userCount = await prisma.adminUser.count();
  if (userCount === 0) {
    const expected = process.env.ADMIN_PASSWORD ?? "";
    if (!expected || password !== expected) {
      return { ok: false, error: "Email or password is incorrect." };
    }
    const owner = await prisma.adminUser.create({
      data: {
        email: normalised,
        name: normalised.split("@")[0].replace(/[._-]+/g, " "),
        passwordHash: await hashPassword(password),
        role: "owner",
        lastLoginAt: new Date(),
      },
    });
    await createSession(owner.id);
    await audit("auth.bootstrap", { userId: owner.id, summary: `Owner account created for ${normalised}` });
    return { ok: true, role: owner.role };
  }

  const user = await prisma.adminUser.findUnique({ where: { email: normalised } });
  // Same message and same work for unknown users to avoid account enumeration.
  if (!user) {
    await verifyPassword(password, `scrypt$${N}$${R}$${P}$${"00".repeat(16)}$${"00".repeat(64)}`);
    return { ok: false, error: "Email or password is incorrect." };
  }
  if (!user.active) return { ok: false, error: "This account is disabled." };
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { ok: false, error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const failed = user.failedLogins + 1;
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedLogins: failed,
        lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60000) : null,
      },
    });
    return { ok: false, error: "Email or password is incorrect." };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await createSession(user.id);
  await audit("auth.login", { userId: user.id, summary: `${user.email} signed in` });
  return { ok: true, role: user.role };
}

/* -------------------------------- audit -------------------------------- */

export async function audit(
  action: string,
  opts: {
    userId?: string | null;
    entity?: string;
    entityId?: string | number;
    summary?: string;
    diff?: unknown;
    ip?: string | null;
  } = {},
): Promise<void> {
  try {
    let ip = opts.ip ?? null;
    if (!ip) {
      const h = await headers();
      const forwarded = h.get("x-forwarded-for");
      ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
    }
    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? null,
        action,
        entity: opts.entity ?? null,
        entityId: opts.entityId === undefined ? null : String(opts.entityId),
        summary: opts.summary ?? null,
        diff: opts.diff === undefined ? undefined : (opts.diff as object),
        ip,
      },
    });
  } catch {
    /* auditing must never break the operation it records */
  }
}

/** Housekeeping: drop expired sessions. Cheap, called from the admin layout. */
export async function pruneSessions(): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
}
