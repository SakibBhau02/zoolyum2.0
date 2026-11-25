"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bulkAction, deleteItem, duplicateItem } from "../actions";
import type { CollectionKey } from "../config";
import { Icon } from "../_ui/icons";

export type Row = {
  id: number;
  title: string;
  subtitle: string;
  status?: string | null;
  thumb?: { kind: "image" | "gradient"; value: string } | null;
  extra?: { label: string; href: string } | null;
  viewHref?: string | null;
};

const STATUSES = ["published", "review", "draft"];

export function CollectionTable({
  collection,
  rows,
  supportsStatus,
  canDelete,
}: {
  collection: CollectionKey;
  rows: Row[];
  supportsStatus: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending] = useTransition();
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => (rows.every((r) => prev.has(r.id)) ? new Set() : new Set(rows.map((r) => r.id))));

  async function runBulk(action: "publish" | "draft" | "delete") {
    if (action === "delete" && !window.confirm(`Delete ${selected.size} item(s)? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    const r = await bulkAction(collection, [...selected], action);
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Bulk action failed.");
    else {
      setSelected(new Set());
      router.refresh();
    }
  }

  if (rows.length === 0) {
    return (
      <div className="a-card-quiet px-6 py-12 text-center">
        <p className="a-title text-[15px]">Nothing here yet</p>
        <p className="a-faint mt-2 text-[12.5px]">Create the first item or clear the filters.</p>
        <Link href={`/admin/${collection}/new`} className="a-btn a-btn-primary mt-4">
          <Icon name="plus" className="h-3.5 w-3.5" /> New item
        </Link>
      </div>
    );
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="a-fade-in mb-2 flex flex-wrap items-center gap-2 rounded-[9px] border border-[rgba(255,106,38,0.4)] bg-[var(--a-accent-soft)] px-3 py-2">
          <span className="text-[12px] font-medium">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {supportsStatus && (
              <>
                <button type="button" disabled={busy} className="a-btn a-btn-sm" onClick={() => runBulk("publish")}>
                  Publish
                </button>
                <button type="button" disabled={busy} className="a-btn a-btn-sm" onClick={() => runBulk("draft")}>
                  Move to draft
                </button>
              </>
            )}
            {canDelete && (
              <button type="button" disabled={busy} className="a-btn a-btn-sm a-btn-danger" onClick={() => runBulk("delete")}>
                Delete
              </button>
            )}
            <button type="button" className="a-btn a-btn-sm a-btn-ghost" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mb-2 text-[12px] text-[var(--a-bad)]">{error}</p>}

      <div className="a-card overflow-hidden">
        <div className="a-scroll overflow-x-auto">
          <table className="a-table">
            <thead>
              <tr>
                <th className="w-9">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 accent-[#ff6a26]"
                  />
                </th>
                <th>Item</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.title}`}
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                      className="h-3.5 w-3.5 accent-[#ff6a26]"
                    />
                  </td>
                  <td>
                    <div className="flex min-w-0 items-center gap-3">
                      {row.thumb?.kind === "image" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.thumb.value} alt="" className="h-9 w-9 shrink-0 rounded-[7px] border border-[var(--a-line)] object-cover" loading="lazy" />
                      )}
                      {row.thumb?.kind === "gradient" && (
                        <span aria-hidden="true" className={`h-9 w-9 shrink-0 rounded-[7px] bg-gradient-to-br ${row.thumb.value}`} />
                      )}
                      <div className="min-w-0">
                        <Link href={`/admin/${collection}/${row.id}`} className="block truncate text-[13px] font-medium hover:text-[var(--a-accent)]">
                          {row.title}
                        </Link>
                        <p className="a-faint truncate text-[11px]">{row.subtitle}</p>
                        {row.extra && (
                          <Link href={row.extra.href} className="mt-0.5 block truncate text-[10.5px] font-medium text-[var(--a-accent)] hover:underline">
                            {row.extra.label}
                          </Link>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {row.status ? <StatusBadge status={row.status} /> : <span className="a-faint text-[11px]">—</span>}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      {row.viewHref && (
                        <a href={row.viewHref} target="_blank" rel="noreferrer" className="a-btn a-btn-sm a-btn-ghost" title="View on site">
                          <Icon name="eye" className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Link href={`/admin/${collection}/${row.id}`} className="a-btn a-btn-sm">
                        Edit
                      </Link>
                      <RowMenu
                        collection={collection}
                        id={row.id}
                        title={row.title}
                        canDelete={canDelete}
                        busy={busy || pending}
                        onBusy={setBusy}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "published" || status === "active" || status === "visible"
      ? "a-badge a-badge-ok"
      : status === "review"
        ? "a-badge a-badge-warn"
        : "a-badge";
  return <span className={tone}>{status}</span>;
}

function RowMenu({
  collection,
  id,
  title,
  canDelete,
  busy,
  onBusy,
}: {
  collection: CollectionKey;
  id: number;
  title: string;
  canDelete: boolean;
  busy: boolean;
  onBusy: (v: boolean) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function duplicate() {
    setOpen(false);
    onBusy(true);
    const r = await duplicateItem(collection, id);
    onBusy(false);
    if (!r.ok) setError(r.error ?? "Duplicate failed.");
    else router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setOpen(false);
    onBusy(true);
    const r = await deleteItem(collection, id);
    onBusy(false);
    if (!r.ok) setError(r.error ?? "Delete failed.");
    else router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="a-btn a-btn-sm a-btn-ghost"
        aria-label={`More actions for ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
      >
        <Icon name="more" className="h-4 w-4" />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div className="a-fade-in absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-[9px] border border-[var(--a-line-strong)] bg-[var(--a-panel-2)] py-1 shadow-xl">
            <button type="button" onClick={duplicate} className="block w-full px-3 py-2 text-left text-[12px] hover:bg-[rgba(246,241,232,0.06)]">
              Duplicate
            </button>
            {canDelete && (
              <button type="button" onClick={remove} className="block w-full px-3 py-2 text-left text-[12px] text-[var(--a-bad)] hover:bg-[rgba(242,112,95,0.1)]">
                Delete
              </button>
            )}
          </div>
        </>
      )}
      {error && <span className="absolute right-0 top-full mt-1 whitespace-nowrap text-[10.5px] text-[var(--a-bad)]">{error}</span>}
    </div>
  );
}

export function statusOptions() {
  return STATUSES;
}
