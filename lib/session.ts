import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET is not set");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !input) return false;
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createSession() {
  const payload = Buffer.from(
    JSON.stringify({ v: 1, exp: Date.now() + TTL_MS }),
    "utf8",
  ).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthed(req?: { cookies: { get(name: string): { value: string } | undefined } }) {
  const raw = req
    ? req.cookies.get(COOKIE)?.value
    : (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return false;
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(sign(payload), "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      v: number;
      exp: number;
    };
    return data.v === 1 && data.exp > Date.now();
  } catch {
    return false;
  }
}