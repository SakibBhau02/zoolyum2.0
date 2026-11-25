"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { saveSeoBulk } from "../../actions";
import { Badge, Card } from "../../_ui/primitives";
import type { RouteRow } from "@/lib/seo-routes";

type Draft = { title: string; description: string };

const norm = (s: string | null) => (s ?? "").trim();

export function BulkEditor({ rows }: { rows: RouteRow[] }) {
  const [state, act, pending] = useActionState(saveSeoBulk, { ok: false });
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(rows.map((r) => [r.path, { title: r.title ?? "", description: r.description ?? "" }])),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.path.toLowerCase().includes(q) ||
        r.label.toLowerCase().includes(q) ||
        r.group.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const changed = useMemo(
    () =>
      rows.filter((r) => {
        const d = drafts[r.path];
        return d && (norm(d.title) !== norm(r.title) || norm(d.description) !== norm(r.description));
      }),
    [rows, drafts],
  );

  const set = (path: string, key: keyof Draft, value: string) =>
    setDrafts((prev) => ({ ...prev, [path]: { ...prev[path], [key]: value } }));

  const resetAll = () =>
    setDrafts(Object.fromEntries(rows.map((r) => [r.path, { title: r.title ?? "", description: r.description ?? "" }])));

  return (
    <form action={act} className="space-y-4">
      <input type="hidden" name="paths" value={changed.map((r) => r.path).join("\n")} />

      <Card className="!p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--a-line)] p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by page, title or group..."
            className="a-input !h-9 max-w-xs flex-1"
            aria-label="Filter routes"
          />
          <span className="a-faint text-[11.5px]">
            {filtered.length} of {rows.length} routes
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Badge tone={changed.length > 0 ? "warn" : "neutral"}>{changed.length} changed</Badge>
            <button type="button" onClick={resetAll} className="a-btn a-btn-ghost a-btn-sm" disabled={changed.length === 0}>
              Discard
            </button>
          </div>
        </div>

        <div className="a-scroll max-h-[62vh] overflow-y-auto">
          <table className="a-table">
            <thead className="sticky top-0 z-10 bg-[var(--a-panel)]">
              <tr>
                <th className="w-[190px]">Page</th>
                <th>Title tag</th>
                <th>Meta description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const d = drafts[row.path];
                const titleLen = d.title.length;
                const descLen = d.description.length;
                const titleBad = titleLen > 0 && (titleLen < 30 || titleLen > 60);
                const descBad = descLen > 0 && (descLen < 80 || descLen > 165);
                return (
                  <tr key={row.path}>
                    <td className="align-top">
                      <Link
                        href={`/admin/seo/edit?path=${encodeURIComponent(row.path)}`}
                        className="block truncate text-[12.5px] font-medium hover:text-[var(--a-accent)]"
                      >
                        {row.label}
                      </Link>
                      <span className="a-faint a-mono block truncate text-[10px]">{row.path}</span>
                      <span className="mt-1 flex gap-1">
                        {row.source === "override" ? (
                          <Badge tone="accent">override</Badge>
                        ) : row.source === "setting" ? (
                          <Badge tone="neutral">default</Badge>
                        ) : (
                          <Badge tone="neutral">generated</Badge>
                        )}
                        {row.noindex && <Badge tone="warn">noindex</Badge>}
                      </span>
                    </td>
                    <td className="align-top">
                      <input
                        name={`t:${row.path}`}
                        value={d.title}
                        onChange={(e) => set(row.path, "title", e.target.value)}
                        className="a-input !h-9 !text-[12px]"
                        aria-label={`Title for ${row.path}`}
                      />
                      <span className={`text-[10.5px] tabular-nums ${titleBad ? "text-[var(--a-warn)]" : "a-faint"}`}>
                        {titleLen}/60
                      </span>
                    </td>
                    <td className="align-top">
                      <textarea
                        name={`d:${row.path}`}
                        value={d.description}
                        onChange={(e) => set(row.path, "description", e.target.value)}
                        rows={3}
                        className="a-textarea !text-[12px]"
                        aria-label={`Description for ${row.path}`}
                      />
                      <span className={`text-[10.5px] tabular-nums ${descBad ? "text-[var(--a-warn)]" : "a-faint"}`}>
                        {descLen}/160
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-[var(--a-line)] bg-[var(--a-panel)] p-3">
          <button type="submit" disabled={pending || changed.length === 0} className="a-btn a-btn-primary">
            {pending ? "Saving..." : `Save ${changed.length || ""} change${changed.length === 1 ? "" : "s"}`}
          </button>
          <p className="a-faint text-[11.5px]">
            Only edited rows are written. Empty both fields to fall back to the generated snippet.
          </p>
          {state.error && <span role="alert" className="text-[11.5px] text-[var(--a-bad)]">{state.error}</span>}
          {state.ok && <span role="status" className="text-[11.5px] text-[var(--a-ok)]">Saved and revalidated.</span>}
        </div>
      </Card>
    </form>
  );
}
