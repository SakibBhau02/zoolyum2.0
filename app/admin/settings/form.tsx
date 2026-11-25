"use client";

import { useActionState, useMemo, useState } from "react";
import { saveSettings } from "../actions";
import type { SettingGroup } from "./registry";

export function SettingsForm({ groups }: { groups: SettingGroup[] }) {
  const [state, act, pending] = useActionState(saveSettings, { ok: false });
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const g of groups) for (const i of g.items) map[i.key] = i.value;
    return map;
  });

  const q = query.trim().toLowerCase();
  // Filtering only hides fields — it never unmounts them, so unsaved edits
  // survive a search.
  const matches = useMemo(() => {
    const set = new Set<string>();
    if (!q) return set;
    for (const g of groups) {
      for (const i of g.items) {
        if (i.label.toLowerCase().includes(q) || i.key.toLowerCase().includes(q) || (i.help ?? "").toLowerCase().includes(q)) {
          set.add(i.key);
        }
      }
    }
    return set;
  }, [groups, q]);

  const shown = q
    ? groups.reduce((n, g) => n + g.items.filter((i) => matches.has(i.key)).length, 0)
    : groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <form action={act} onChange={() => setDirty(true)} className="grid gap-6 lg:grid-cols-[190px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-[70px] space-y-0.5">
          <p className="a-faint mb-2 px-2 text-[9.5px] font-bold uppercase tracking-[0.16em]">Jump to</p>
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="block truncate rounded-[7px] px-2 py-1.5 text-[11.5px] text-[var(--a-muted)] transition-colors hover:bg-[rgba(246,241,232,0.05)] hover:text-[var(--a-text)]"
            >
              {g.title}
            </a>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter settings by label, key or help text..."
              aria-label="Filter settings"
              className="a-input !pl-9"
            />
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--a-faint)]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="a-faint text-[11px]">{shown} field{shown === 1 ? "" : "s"}</span>
        </div>

        <div className="space-y-4">
          {groups.map((group) => {
            const groupVisible = !q || group.items.some((i) => matches.has(i.key));
            return (
              <section key={group.id} id={group.id} hidden={!groupVisible} className="a-card scroll-mt-20 p-5">
                <div className="mb-4">
                  <h2 className="a-title text-[15px]">{group.title}</h2>
                  {group.hint && <p className="a-faint mt-1 max-w-2xl text-[11.5px] leading-relaxed">{group.hint}</p>}
                </div>
                <div className="space-y-4">
                  {group.items.map((item) => {
                    const length = values[item.key]?.length ?? 0;
                    const limit = item.suffix ? Number(item.suffix) : 0;
                    const over = limit > 0 && length > limit;
                    const hide = Boolean(q) && !matches.has(item.key);
                    return (
                      <div key={item.key} hidden={hide}>
                        <div className="flex items-baseline justify-between gap-3">
                          <label htmlFor={`s-${item.key}`} className="a-label !mb-1.5">
                            {item.label}
                            {item.type === "secret" && (
                              <span className="a-faint ml-2 font-normal normal-case tracking-normal">· secret, server-only</span>
                            )}
                          </label>
                          {limit > 0 && (
                            <span className={`text-[10.5px] tabular-nums ${over ? "text-[var(--a-bad)]" : "text-[var(--a-faint)]"}`}>
                              {length}/{limit}
                            </span>
                          )}
                        </div>
                        {item.type === "long" ? (
                          <textarea
                            id={`s-${item.key}`}
                            name={`s:${item.key}`}
                            defaultValue={item.value}
                            rows={item.key.includes("faqs") || item.key.includes("values") || item.key.includes("steps") ? 6 : 3}
                            spellCheck={false}
                            onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))}
                            className="a-textarea !text-[12px]"
                          />
                        ) : (
                          <input
                            id={`s-${item.key}`}
                            name={`s:${item.key}`}
                            type={item.type === "secret" ? "password" : "text"}
                            defaultValue={item.value}
                            autoComplete="off"
                            spellCheck={false}
                            onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))}
                            className="a-input"
                          />
                        )}
                        {item.help && <p className="a-help">{item.help}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="sticky bottom-3 z-10 mt-5 flex flex-wrap items-center gap-3 rounded-[11px] border border-[var(--a-line-strong)] bg-[rgba(34,28,23,0.95)] px-4 py-3 backdrop-blur-md">
          <button type="submit" disabled={pending} className="a-btn a-btn-primary">
            {pending ? "Saving..." : "Save changes"}
          </button>
          <span className={`text-[11.5px] ${dirty ? "text-[var(--a-warn)]" : "a-faint"}`}>
            {dirty ? "Unsaved changes" : "Everything is saved"}
          </span>
          {state.error && <span role="alert" className="text-[11.5px] text-[var(--a-bad)]">{state.error}</span>}
          {state.ok && !dirty && <span role="status" className="text-[11.5px] text-[var(--a-ok)]">Saved — live everywhere.</span>}
        </div>
      </div>
    </form>
  );
}
