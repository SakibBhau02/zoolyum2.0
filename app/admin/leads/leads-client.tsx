"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead, setLeadRead } from "../actions";

export function LeadActions({ id, read }: { id: number; read: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Failed.");
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setLeadRead(id, !read))}
        className="a-btn a-btn-sm"
      >
        {read ? "Mark unread" : "Mark read"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this lead?")) return;
          run(() => deleteLead(id));
        }}
        className="a-btn a-btn-sm a-btn-danger"
      >
        Delete
      </button>
      {error && <span className="text-[10.5px] text-[var(--a-bad)]">{error}</span>}
    </div>
  );
}
