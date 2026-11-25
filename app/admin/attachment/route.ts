import { NextRequest } from "next/server";
import { can, getSessionUser } from "@/lib/auth";
import { readPrivateFile } from "@/lib/storage-private";

/**
 * Authenticated download for private attachments (candidate CVs).
 *
 * The key never becomes a public URL: the browser asks this route, the route
 * checks the session and streams the object back with `no-store`. Delete the
 * lead/revision and the file is unreachable.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!can(user.role, "editor")) return new Response("Forbidden", { status: 403 });

  const key = req.nextUrl.searchParams.get("key") ?? "";
  if (!key) return new Response("Missing key", { status: 400 });

  let file: Awaited<ReturnType<typeof readPrivateFile>> = null;
  try {
    file = await readPrivateFile(key);
  } catch {
    return new Response("Attachment unavailable", { status: 503 });
  }
  if (!file) return new Response("Not found", { status: 404 });

  const filename = file.name.replace(/["\\\r\n]/g, "_");
  return new Response(file.stream as BodyInit, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
