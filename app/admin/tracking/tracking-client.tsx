"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings, sendTestTrackingEvent } from "../actions";
import { Badge } from "../_ui/primitives";

export type TrackingField = {
  key: string;
  label: string;
  help?: string;
  secret?: boolean;
  value: string;
};

export function TrackingForm({ fields }: { fields: TrackingField[] }) {
  const [state, act, pending] = useActionState(saveSettings, { ok: false });
  return (
    <form action={act} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={`s-${field.key}`} className="a-label">
              {field.label}
              {field.secret && (
                <span className="a-faint ml-2 font-normal normal-case tracking-normal">· server-only</span>
              )}
            </label>
            <input
              id={`s-${field.key}`}
              name={`s:${field.key}`}
              type={field.secret ? "password" : "text"}
              defaultValue={field.value}
              className="a-input"
              autoComplete="off"
              spellCheck={false}
            />
            {field.help && <p className="a-help">{field.help}</p>}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--a-line)] pt-3">
        <button type="submit" disabled={pending} className="a-btn a-btn-primary">
          {pending ? "Saving..." : "Save tracking settings"}
        </button>
        {state.error && <span role="alert" className="text-[11.5px] text-[var(--a-bad)]">{state.error}</span>}
        {state.ok && <span role="status" className="text-[11.5px] text-[var(--a-ok)]">Saved — live after the next render.</span>}
      </div>
    </form>
  );
}

export function TestEventButton({ provider, label }: { provider: "meta" | "ga4"; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; detail: string } | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className="a-btn a-btn-sm"
        onClick={async () => {
          setBusy(true);
          setResult(null);
          const r = await sendTestTrackingEvent(provider);
          setBusy(false);
          setResult({ ok: r.ok, detail: r.detail ?? r.error ?? "" });
          router.refresh();
        }}
      >
        {busy ? "Sending..." : label}
      </button>
      {result && (
        <Badge tone={result.ok ? "ok" : "bad"}>
          {result.ok ? "Sent" : "Failed"}
        </Badge>
      )}
      {result && !result.ok && result.detail && (
        <span className="a-faint max-w-[280px] truncate text-[10.5px]" title={result.detail}>
          {result.detail}
        </span>
      )}
    </div>
  );
}
