"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearNotFound } from "../../actions";

export function ClearButton({ id }: { id?: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="a-btn a-btn-sm a-btn-ghost"
      onClick={async () => {
        if (id === undefined && !window.confirm("Clear the whole broken-URL log?")) return;
        setBusy(true);
        await clearNotFound(id);
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? "..." : id === undefined ? "Clear all" : "Dismiss"}
    </button>
  );
}
