import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader } from "../_ui/primitives";
import { CreateUserForm, UserRow } from "./users-client";
import { relativeTime } from "../_ui/format";

const ROLE_HINT: Record<string, string> = {
  owner: "Full control, including creating other owners.",
  admin: "Manage content, settings, users and delete records.",
  editor: "Create and edit content, upload media, publish.",
  viewer: "Read-only access to the admin.",
};

export default async function UsersPage() {
  const me = await requireUser("admin");
  const users = await prisma.adminUser.findMany({ orderBy: [{ role: "asc" }, { createdAt: "asc" }] }).catch(() => []);
  const ownerCount = users.filter((u) => u.role === "owner").length;

  return (
    <div>
      <PageHeader
        eyebrow="Site"
        title={
          <>
            Team &amp; access<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="Everyone who can sign in, what they are allowed to do, and when they last did it."
        actions={
          <Link href="/admin/audit" className="a-btn">
            View activity log
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Card padded={false}>
          <div className="border-b border-[var(--a-line)] px-5 py-4">
            <h2 className="a-title text-[15px]">Accounts</h2>
            <p className="a-faint mt-1 text-[11.5px]">{users.length} account{users.length === 1 ? "" : "s"} · {ownerCount} owner{ownerCount === 1 ? "" : "s"}</p>
          </div>
          {users.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No accounts yet" description="Create the first account on the right." />
            </div>
          ) : (
            <ul className="divide-y divide-[var(--a-line)]">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  isSelf={user.id === me.id}
                  isOwner={user.role === "owner"}
                  canPromote={me.role === "owner"}
                  user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    active: user.active,
                    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
                    lastSeen: user.lastLoginAt ? relativeTime(user.lastLoginAt) : "never",
                    locked: Boolean(user.lockedUntil),
                  }}
                />
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="a-title text-[15px]">Create an account</h2>
            <p className="a-faint mt-1 mb-4 text-[11.5px]">They can change the password after their first sign-in.</p>
            <CreateUserForm canCreateOwner={me.role === "owner"} />
          </Card>

          <Card>
            <h2 className="a-title text-[15px]">Roles</h2>
            <ul className="mt-3 space-y-2.5">
              {Object.entries(ROLE_HINT).map(([role, hint]) => (
                <li key={role} className="flex gap-2.5">
                  <Badge tone={role === "owner" ? "accent" : "neutral"}>{role}</Badge>
                  <span className="a-faint text-[11.5px] leading-relaxed">{hint}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
