import { NextRequest, NextResponse } from "next/server";
import { recordNotFound } from "@/lib/seo";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/** Best-effort 404 beacon, called from the not-found page. */
export async function POST(req: NextRequest) {
  const limit = rateLimit(clientKey(req.headers, "404"), 60, 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: true });
  try {
    const body = (await req.json()) as { path?: string };
    if (typeof body.path === "string") await recordNotFound(body.path);
  } catch {
    /* ignore malformed bodies */
  }
  return NextResponse.json({ ok: true });
}
