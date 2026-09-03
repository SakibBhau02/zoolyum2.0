import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/session";

export default async function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  if (req.nextUrl.pathname.startsWith("/admin/login"))
    return NextResponse.next({ request: { headers } });
  if (await isAuthed(req)) return NextResponse.next({ request: { headers } });
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
