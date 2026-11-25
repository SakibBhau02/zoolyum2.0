"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "../actions";

export function CreateUserForm({ canCreateOwner }: { canCreateOwner: boolean }) {
  const router = useRouter();
  const [state, act, pending] = useActionState(createUser, { ok: false });
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);
  return (
    <form action={act} className="space-y-3.5">
      <div>
        <label htmlFor="nu-name" className="a-label">Name</label>
        <input id="nu-name" name="name" required className="a-input" placeholder="Full name" />
      </div>
      <div>
        <label htmlFor="nu-email" className="a-label">Email</label>
        <input id="nu-email" name="email" type="email" required className="a-input" placeholder="name@zoolyum.com" />
      </div>
      <div>
        <label htmlFor="nu-password" className="a-label">Temporary password</label>
        <input id="nu-password" name="password" type="password" required minLength={10} className="a-input" autoComplete="new-password" />
        <p className="a-help">At least 10 characters. Share it over a secure channel.</p>
      </div>
      <div>
        <label htmlFor="nu-role" className="a-label">Role</label>
        <select id="nu-role" name="role" className="a-select" defaultValue="editor">
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
          {canCreateOwner && <option value="owner">Owner</option>}
        </select>
      </div>
      {state.error && <p role="alert" className="text-[12px] text-[var(--a-bad)]">{state.error}</p>}
      {state.ok && <p role="status" className="text-[12px] text-[var(--a-ok)]">Account created.</p>}
      <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full">
        {pending ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}

type RowUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
  lastSeen: string;
  locked: boolean;
};

export function UserRow({
  user,
  isSelf,
  isOwner,
  canPromote,
}: {
  user: RowUser;
  isSelf: boolean;
  isOwner: boolean;
  canPromote: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  async function run(patch: Parameters<typeof updateUser>[1]) {
    setPending(true);
    setError("");
    const r = await updateUser(user.id, patch);
    setPending(false);
    if (!r.ok) setError(r.error ?? "Update failed.");
    else {
      setPassword("");
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--a-line-strong)] bg-[var(--a-panel-2)] text-[11px] font-semibold">
          {user.name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">
            {user.name} {isSelf && <span className="a-faint text-[10.5px]">(you)</span>}
          </p>
          <p className="a-faint truncate text-[11px]">{user.email}</p>
        </div>
        <span className={`a-badge ${user.role === "owner" ? "a-badge-accent" : ""}`}>{user.role}</span>
        {!user.active && <span className="a-badge a-badge-bad">disabled</span>}
        {user.locked && <span className="a-badge a-badge-warn">locked</span>}
        <span className="a-faint hidden w-24 text-right text-[10.5px] sm:block">{user.lastSeen}</span>
        <button type="button" className="a-btn a-btn-sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          Manage
        </button>
      </div>

      {open && (
        <div className="a-fade-in mt-3 rounded-[10px] border border-[var(--a-line)] bg-[rgba(23,19,16,0.6)] p-3.5">
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="min-w-[140px] flex-1">
              <label className="a-label" htmlFor={`role-${user.id}`}>Role</label>
              <select
                id={`role-${user.id}`}
                className="a-select"
                defaultValue={user.role}
                disabled={pending || (isOwner && !canPromote)}
                onChange={(e) => run({ role: e.target.value })}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
                <option value="owner" disabled={!canPromote}>Owner</option>
              </select>
            </div>
            <div className="min-w-[170px] flex-1">
              <label className="a-label" htmlFor={`pw-${user.id}`}>Reset password</label>
              <input
                id={`pw-${user.id}`}
                type="password"
                className="a-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (10+ chars)"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              className="a-btn a-btn-sm"
              disabled={pending || password.length < 10}
              onClick={() => run({ password })}
            >
              Set password
            </button>
            {!isSelf && (
              <button
                type="button"
                className={`a-btn a-btn-sm ${user.active ? "a-btn-danger" : ""}`}
                disabled={pending}
                onClick={() => run({ active: !user.active })}
              >
                {user.active ? "Disable" : "Enable"}
              </button>
            )}
          </div>
          {error && <p role="alert" className="mt-2 text-[11.5px] text-[var(--a-bad)]">{error}</p>}
          <p className="a-faint mt-2 text-[10.5px]">
            Changing a password signs that account out everywhere.
          </p>
        </div>
      )}
    </li>
  );
}
