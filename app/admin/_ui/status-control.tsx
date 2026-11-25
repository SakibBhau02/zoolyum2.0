"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setWorkflowStatus } from "../actions";
import { Icon } from "./icons";

const OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
] as const;

export function StatusControl({
  collection,
  id,
  status,
}: {
  collection: "posts" | "projects";
  id: number;
  status: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function set(next: "draft" | "review" | "published") {
    if (next === current) return;
    setBusy(next);
    setError("");
    const r = await setWorkflowStatus(collection, id, next);
    setBusy(null);
    if (!r.ok) setError(r.error ?? "Could not change the status.");
    else {
      setCurrent(next);
      router.refresh();
    }
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="a-faint text-[10.5px] font-bold uppercase tracking-[0.14em]">Status</span>
      <div className="flex overflow-hidden rounded-[8px] border border-[var(--a-line-strong)]">
        {OPTIONS.map((option) => {
          const active = current === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={busy !== null}
              onClick={() => set(option.value)}
              aria-pressed={active}
              className={`px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
                active
                  ? option.value === "published"
                    ? "bg-[rgba(93,211,158,0.16)] text-[var(--a-ok)]"
                    : option.value === "review"
                      ? "bg-[rgba(242,181,68,0.16)] text-[var(--a-warn)]"
                      : "bg-[rgba(246,241,232,0.08)] text-[var(--a-text)]"
                  : "text-[var(--a-muted)] hover:text-[var(--a-text)]"
              }`}
            >
              {busy === option.value ? "..." : option.label}
            </button>
          );
        })}
      </div>
      <a href={`/admin/${collection}/${id}/history`} className="a-btn a-btn-sm a-btn-ghost">
        <Icon name="history" className="h-3.5 w-3.5" /> History
      </a>
      {error && <span role="alert" className="text-[11px] text-[var(--a-bad)]">{error}</span>}
    </div>
  );
}
