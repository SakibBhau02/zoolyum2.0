"use client";

import { useActionState } from "react";
import { saveSettings } from "../actions";

const HELP: Record<string, string> = {
  "seo.google_verification": "Google Search Console HTML-tag token (the content value only). Empty = no verification tag.",
  "seo.pinterest_verification": "Pinterest domain claim token (the content value only). Empty = no verification tag.",  "analytics.ga4_id": "GA4 Measurement ID, e.g. G-XXXXXXXXXX. Empty = tag disabled.",
  "analytics.gtm_id": "GTM container ID, e.g. GTM-XXXXXXX. When set, GA4 loads through GTM (direct gtag is skipped to avoid double PageViews).",
  "analytics.clarity_id": "Microsoft Clarity project ID. Empty = disabled.",
  "analytics.pixel_id": "Meta Pixel ID (numeric). Enables browser Pixel + dedupes with CAPI via shared event_id.",
  "analytics.meta_capi_token": "Meta Conversions API access token (Events Manager → Settings). Server-only.",
  "analytics.meta_test_event_code": "Optional CAPI test_event_code for Events Manager → Test Events verification.",
  "analytics.ga4_api_secret": "GA4 Measurement Protocol API secret (Admin → Data Streams → MP API secrets). Server-only.",
  "analytics.server_tracking_enabled": "Set to 'false' to pause server events without deleting tokens.",
  "social.facebook": "Full page URL, e.g. https://facebook.com/zoolyum — used by footer icons.",
  "contact.mapUrl": "Full Google Maps link opened by the Contact card and footer address.",
};

function FieldHelp({ k }: { k: string }) {
  const h = HELP[k];
  if (!h) return null;
  return <p className="mb-2 font-body text-xs leading-relaxed text-ivory/40">{h}</p>;
}

export function SettingsForm({
  grouped,
  rest,
}: {
  grouped: { title: string; prefix: string; hint?: string; items: { key: string; value: string }[] }[];
  rest: { key: string; value: string }[];
}) {
  const [state, act, pending] = useActionState(saveSettings, { ok: false });
  const long = (v: string) => v.length > 80;
  const isSecret = (k: string) => /token|secret/i.test(k);
  return (
    <form action={act} className="space-y-8">
      {[...grouped.map((g) => ({ title: g.title, hint: g.hint, items: g.items })), ...(rest.length ? [{ title: "Other", hint: undefined as string | undefined, items: rest }] : [])].map(
        (g) =>
          g.items.length > 0 && (
            <div key={g.title} className="card-surface p-6">
              <h2 className="font-display text-lg font-semibold text-ivory">{g.title}</h2>
              {g.hint && <p className="mt-2 max-w-2xl font-body text-xs leading-relaxed text-ivory/45">{g.hint}</p>}
              <div className="mt-5 space-y-5">
                {g.items.map((s) => (
                  <div key={s.key}>
                    <label htmlFor={`s-${s.key}`} className="mb-2 block font-mono text-xs text-sienna-bright">
                      {s.key}
                      {isSecret(s.key) && <span className="ml-2 text-ivory/40">· server-only, never rendered</span>}
                    </label>
                    <FieldHelp k={s.key} />
                    {isSecret(s.key) && !long(s.value) ? (
                      <input
                        id={`s-${s.key}`}
                        name={`s:${s.key}`}
                        type="password"
                        autoComplete="off"
                        spellCheck={false}
                        defaultValue={s.value}
                        placeholder={HELP[s.key] ?? ""}
                        className="w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none"
                      />
                    ) : long(s.value) || isSecret(s.key) ? (
                      <textarea
                        id={`s-${s.key}`}
                        name={`s:${s.key}`}
                        defaultValue={s.value}
                        rows={3}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={HELP[s.key] ?? ""}
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