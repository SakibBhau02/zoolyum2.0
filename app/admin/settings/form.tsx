"use client";

import { useActionState } from "react";
import { saveSettings } from "../actions";

export function SettingsForm({
  grouped,
  rest,
}: {
  grouped: { title: string; prefix: string; items: { key: string; value: string }[] }[];
  rest: { key: string; value: string }[];
}) {
  const [state, act, pending] = useActionState(saveSettings, { ok: false });
  const long = (v: string) => v.length > 80;
  return (
    <form action={act} className="space-y-8">
      {[...grouped.map((g) => ({ title: g.title, items: g.items })), ...(rest.length ? [{ title: "Other", items: rest }] : [])].map(
        (g) =>
          g.items.length > 0 && (
            <div key={g.title} className="card-surface p-6">
              <h2 className="font-display text-lg font-semibold text-ivory">{g.title}</h2>
              <div className="mt-5 space-y-5">
                {g.items.map((s) => (
                  <div key={s.key}>
                    <label htmlFor={`s-${s.key}`} className="mb-2 block font-mono text-xs text-sienna-bright">
                      {s.key}
                    </label>
                    {long(s.value) ? (
                      <textarea
                        id={`s-${s.key}`}
                        name={`s:${s.key}`}
                        defaultValue={s.value}
                        rows={3}
                        className="w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none"
                      />
                    ) : (
                      <input
                        id={`s-${s.key}`}
                        name={`s:${s.key}`}
                        defaultValue={s.value}
                        className="w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ),
      )}
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-lg border border-sienna/40 bg-sienna/10 px-4 py-3 font-body text-sm text-sienna-bright">
          Saved - live everywhere.
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}