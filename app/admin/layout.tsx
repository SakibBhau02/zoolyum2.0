import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { pruneSessions, requireUser } from "@/lib/auth";
import { AdminShell } from "./_ui/shell";
import "./admin.css";

/** The private CMS must never appear in search results. */
export const metadata: Metadata = {
  title: { absolute: "Admin — Zoolyum" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  // The login screen is public by definition; everything else requires a user.
  if (pathname.startsWith("/admin/login")) {
    return <div className="a-root min-h-svh">{children}</div>;
  }

  const user = await requireUser("viewer");

  // Cheap housekeeping: drop expired sessions on admin load. Fire-and-forget
  // so a slow delete never delays the shell.
  void pruneSessions();

  let unread = 0;
  let online = true;
  try {
    unread = await prisma.lead.count({ where: { read: false } });
  } catch {
    online = false;
  }

  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} unread={unread} online={online}>
      {children}
    </AdminShell>
  );
}
