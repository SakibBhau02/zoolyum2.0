"use client";

import { useEffect, useRef, useState } from "react";
import { autosaveItem } from "../actions";
import type { CollectionKey } from "../config";

export type AutosaveState = {
  status: "idle" | "saving" | "saved" | "error";
  savedAt: string | null;
  error: string;
};

/**
 * Debounced autosave for the editors.
 *
 * Watches the form for input/change, waits three seconds of quiet, then posts
 * the whole FormData to `autosaveItem`. It is deliberately silent on failure:
 * an autosave error must never interrupt typing — the explicit Save button is
 * still the source of truth.
 */
export function useAutosave({
  formRef,
  collection,
  id,
  enabled,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  collection: CollectionKey;
  id: number;
  enabled: boolean;
}): AutosaveState {
  const [status, setStatus] = useState<AutosaveState["status"]>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    const form = formRef.current;
    if (!form) return;
    let cancelled = false;

    const schedule = () => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(async () => {
        if (cancelled) return;
        setStatus("saving");
        setError("");
        const result = await autosaveItem(collection, id, new FormData(form));
        if (cancelled) return;
        if (result.ok) {
          setStatus("saved");
          setSavedAt(result.savedAt ?? new Date().toISOString());
        } else {
          setStatus("error");
          setError(result.error ?? "Autosave failed.");
        }
      }, 3000);
    };

    form.addEventListener("input", schedule);
    form.addEventListener("change", schedule);
    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
      form.removeEventListener("input", schedule);
      form.removeEventListener("change", schedule);
    };
  }, [formRef, collection, id, enabled]);

  return { status, savedAt, error };
}

export function AutosaveLabel({ state }: { state: AutosaveState }) {
  if (state.status === "idle") return null;
  if (state.status === "saving") {
    return <span className="a-faint text-[11px]">Saving draft...</span>;
  }
  if (state.status === "error") {
    return <span className="text-[11px] text-[var(--a-warn)]">Autosave paused — use Save</span>;
  }
  const when = state.savedAt
    ? new Date(state.savedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : "";
  return (
    <span className="text-[11px] text-[var(--a-ok)]">
      Draft saved{when ? ` at ${when}` : ""}
    </span>
  );
}
