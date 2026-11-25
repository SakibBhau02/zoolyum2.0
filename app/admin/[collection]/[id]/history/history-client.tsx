"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreRevision } from "../../../actions";

export function RestoreButton({
  revisionId,
  collection,
  recordId,
}: {
  revisionId: number;
  collection: string;
  recordId: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className="a-btn a-btn-sm"
        onClick={async () => {
          if (!window.confirm("Restore this version? The current content will be replaced.")) return;
          setBusy(true);
          setError("");
          const r = await restoreRevision(revisionId);
          setBusy(false);
          if (!r.ok) setError(r.error ?? "Restore failed.");
          else {
            router.push(`/admin/${collection}/${recordId}`);
            router.refresh();
          }
        }}
      >
        {busy ? "Restoring..." : "Restore"}
      </button>
      {error && <span className="text-[10.5px] text-[var(--a-bad)]">{error}</span>}
    </div>
  );
}
