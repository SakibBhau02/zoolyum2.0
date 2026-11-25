"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRedirect, deleteRedirect, toggleRedirect } from "../../actions";

export function NewRedirectForm({ defaultSource = "" }: { defaultSource?: string }) {
  const router = useRouter();
  const [state, act, pending] = useActionState(createRedirect, { ok: false });
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={act} className="space-y-3">
      <div>
        <label htmlFor="r-source" className="a-label">From</label>
        <input id="r-source" name="source" defaultValue={defaultSource} required placeholder="/old-page" className="a-input" />
      </div>
      <div>
        <label htmlFor="r-destination" className="a-label">To</label>
        <input id="r-destination" name="destination" required placeholder="/new-page or https://..." className="a-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="r-code" className="a-label">Type</label>
          <select id="r-code" name="statusCode" className="a-select" defaultValue="301">
            <option value="301">301 — permanent</option>
            <option value="302">302 — temporary</option>
            <option value="307">307 — temporary, keep method</option>
            <option value="308">308 — permanent, keep method</option>
          </select>
        </div>
        <div>
          <label htmlFor="r-note" className="a-label">Note</label>
          <input id="r-note" name="note" placeholder="Optional" className="a-input" />
        </div>
      </div>
      {state.error && <p role="alert" className="text-[11.5px] text-[var(--a-bad)]">{state.error}</p>}
      {state.ok && <p role="status" className="text-[11.5px] text-[var(--a-ok)]">Redirect created.</p>}
      <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full">
        {pending ? "Creating..." : "Add redirect"}
      </button>
    </form>
  );
}

export function RedirectRow({
  row,
}: {
  row: { id: number; source: string; destination: string; statusCode: number; hits: number; active: boolean; note: string | null };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError("");
    const r = await fn();
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Failed.");
    else router.refresh();
  }

  return (
    <tr>
      <td className="a-mono max-w-[220px]">
        <span className="block truncate">{row.source}</span>
        {row.note && <span className="a-faint block truncate text-[10px]">{row.note}</span>}
      </td>
      <td className="a-mono max-w-[240px]">
        <span className="block truncate">{row.destination}</span>
      </td>
      <td>
        <span className="a-badge">{row.statusCode}</span>
      </td>
      <td className="tabular-nums text-[12px]">{row.hits}</td>
      <td>
        <span className={`a-badge ${row.active ? "a-badge-ok" : "a-badge-bad"}`}>{row.active ? "active" : "off"}</span>
      </td>
      <td>
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" disabled={busy} className="a-btn a-btn-sm" onClick={() => run(() => toggleRedirect(row.id, !row.active))}>
            {row.active ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            disabled={busy}
            className="a-btn a-btn-sm a-btn-danger"
            onClick={() => {
              if (window.confirm(`Delete the redirect from ${row.source}?`)) void run(() => deleteRedirect(row.id));
            }}
          >
            Delete
          </button>
        </div>
        {error && <p className="mt-1 text-right text-[10.5px] text-[var(--a-bad)]">{error}</p>}
      </td>
    </tr>
  );
}
