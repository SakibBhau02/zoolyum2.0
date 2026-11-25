import { prisma } from "@/lib/prisma";

/** Serves the IndexNow key so the protocol can verify ownership. */
export async function GET() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "analytics.indexnow_key" } });
    const key = row?.value?.trim();
    if (!key) return new Response("Not configured", { status: 404 });
    return new Response(key, {
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
