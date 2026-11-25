import { NextRequest, NextResponse } from "next/server";

const COOKIE = "zy_admin";

/**
 * Optimistic gate + redirect table.
 *
 * Next 16 renamed middleware to proxy and explicitly recommends against using
 * it as a session store: it runs before render and should stay cheap. It can
 * run on the CDN, so it must not be the authorization layer.
 *
 * The real check — session validity, role, account status — happens in
 * `app/admin/layout.tsx` and in every server action through `lib/auth.ts`.
 *
 * Redirects are cached for five minutes per instance so the common path is a
 * map lookup, not a database round trip. A new redirect can take up to five
 * minutes to appear on a warm instance; that is an acceptable trade for not
 * querying Postgres on every page view.
 */

type Rule = { to: string; code: number };
let cache: { at: number; rules: Map<string, Rule> } = { at: 0, rules: new Map() };

/**
 * Only same-origin paths and explicit http(s) destinations are redirectable.
 * A compromised admin account must not be able to turn a database row into an
 * open redirect (`//evil.com`) or a `javascript:` URL.
 */
function safeDestination(to: string): string | null {
  const value = (to ?? "").trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    /* not a URL */
  }
  return null;
}

async function redirectRules(): Promise<Map<string, Rule>> {
  if (Date.now() - cache.at < 300_000) return cache.rules;
  try {
    // Deferred import: the proxy must still start if the database is down or
    // if it is deployed to an environment without Prisma support.
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.redirect.findMany({ where: { active: true }, select: { source: true, destination: true, statusCode: true } });
    cache = {
      at: Date.now(),
      rules: new Map(rows.map((r) => [r.source, { to: r.destination, code: r.statusCode }])),
    };
  } catch {
    cache = { at: Date.now(), rules: new Map() };
  }
  return cache.rules;
}

export default async function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);
  const { pathname } = req.nextUrl;
  headers.set("x-pathname", pathname);

  /* ------------------------------ admin gate ------------------------------ */
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next({ request: { headers } });
    }
    if (req.cookies.get(COOKIE)?.value) {
      return NextResponse.next({ request: { headers } });
    }
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  /* ------------------------------- redirects ------------------------------ */
  if (req.method === "GET" || req.method === "HEAD") {
    const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const rule = (await redirectRules()).get(clean);
    const destination = rule ? safeDestination(rule.to) : null;
    if (rule && destination) {
      void import("@/lib/prisma")
        .then(({ prisma }) => prisma.redirect.updateMany({ where: { source: clean }, data: { hits: { increment: 1 } } }))
        .catch(() => {});
      const target = destination.startsWith("/") ? new URL(destination, req.url).toString() : destination;
      const res = NextResponse.redirect(target, rule.code);
      res.headers.set("x-redirect-source", "db");
      return res;
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*", "/((?!_next|api|.*\\.[a-zA-Z0-9]+$).*)"],
};
