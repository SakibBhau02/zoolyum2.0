"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  loginAction,
  saveItem,
  deleteItem,
  uploadMedia,
  setLeadRead,
  deleteLead,
  listMedia,
} from "./actions";
import type { CollectionKey, FieldDef } from "./config";

export function LoginForm({ next }: { next: string }) {
  const [state, act] = useActionState(loginAction, { ok: false });
  return (
    <form action={act} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="admin-password" className="mb-2 block font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-olive/35 bg-espresso px-4 py-3 font-body text-[15px] text-ivory focus:border-sienna-bright/70 focus:outline-none"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full">
        Enter admin
      </button>
    </form>
  );
}

export function DeleteButton({
  collection,
  id,
  what,
}: {
  collection: CollectionKey;
  id: number;
  what: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm(`Delete "${what}"? This cannot be undone.`)) return;
          setBusy(true);
          setError("");
          const r = await deleteItem(collection, id);
          setBusy(false);
          if (!r.ok) setError(r.error ?? "Delete failed.");
          else router.refresh();
        }}
        className="rounded-lg border border-red-400/40 px-3.5 py-2 font-body text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-40"
      >
        {busy ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="ml-2 font-body text-xs text-red-300">{error}</span>}
    </>
  );
}

type MediaItem = { id: number; url: string; alt: string | null; mime: string | null };

function safeParse<T>(raw: string, fallback: T): T {
  try {
    const v = JSON.parse(raw || "") as T;
    return v === null || v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

function linesToText(list: unknown): string {
  return Array.isArray(list) ? list.map((s: unknown) => String(s ?? "")).join("\n") : "";
}

function textToLines(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

type SubField = { key: string; label: string; rows?: number; placeholder?: string };

function rowIsEmpty(row: Record<string, string>, fields: SubField[]): boolean {
  return fields.every((f) => !(row[f.key] ?? "").trim());
}

function cleanRows(rows: Record<string, string>[], fields: SubField[]): Record<string, string>[] {
  return rows
    .filter((r) => !rowIsEmpty(r, fields))
    .map((r) => {
      const o: Record<string, string> = {};
      for (const f of fields) o[f.key] = (r[f.key] ?? "").trim();
      return o;
    });
}

function emptyRow(fields: SubField[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (const f of fields) o[f.key] = "";
  return o;
}

function rowFromJson(v: unknown, fields: SubField[]): Record<string, string> {
  const o: Record<string, string> = {};
  const src = (v ?? {}) as Record<string, unknown>;
  for (const f of fields) o[f.key] = typeof src[f.key] === "string" ? (src[f.key] as string) : "";
  return o;
}

const rowCls = "rounded-xl border border-olive/25 bg-espresso/60 p-4";
const subLabelCls = "mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/45";
const subInputCls = "w-full rounded-lg border border-olive/35 bg-espresso px-3.5 py-2 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
const addBtnCls = "rounded-lg border border-dashed border-olive/40 px-3.5 py-2 font-body text-xs font-semibold text-ivory/60 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright";
const rmBtnCls = "rounded-lg border border-red-400/30 px-3 py-1.5 font-body text-xs text-red-300/80 transition-colors hover:bg-red-500/10 hover:text-red-300";
const ghostBtnCls = "shrink-0 rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/70 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright";

const QA_FIELDS: SubField[] = [
  { key: "q", label: "Question", placeholder: "Type the question" },
  { key: "a", label: "Answer", rows: 3, placeholder: "Type the answer" },
];
export const STAT_FIELDS: SubField[] = [
  { key: "value", label: "Value", placeholder: "e.g. +42%" },
  { key: "label", label: "Label", placeholder: "e.g. enrollment lift in 3 months" },
];
const PROCESS_FIELDS: SubField[] = [
  { key: "step", label: "Step", placeholder: "e.g. Discover" },
  { key: "detail", label: "Detail", rows: 2, placeholder: "What happens in this step" },
];
const STORY_FIELDS: SubField[] = [
  { key: "label", label: "Label", placeholder: "e.g. Act one" },
  { key: "title", label: "Title", placeholder: "Give the act a title" },
  { key: "body", label: "Body", rows: 3, placeholder: "Tell this part of the story" },
];
const OBSTACLE_FIELDS: SubField[] = [
  { key: "title", label: "Title", placeholder: "e.g. Invisible on a crowded road" },
  { key: "how", label: "How we solved it", rows: 2, placeholder: "How you solved it" },
];

function EditableRows({
  items,
  onChange,
  fields,
  addLabel,
  onBrowse,
}: {
  items: Record<string, string>[];
  onChange: (v: Record<string, string>[]) => void;
  fields: SubField[];
  addLabel: string;
  onBrowse?: (index: number) => void;
}) {
  const set = (i: number, key: string, val: string) =>
    onChange(items.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  return (
    <div className="space-y-3">
      {items.map((row, i) => (
        <div key={i} className={rowCls}>
          <div className="space-y-3">
            {fields.map((f, fi) => (
              <div key={f.key}>
                <label className={subLabelCls}>{f.label}</label>
                <div className="flex gap-2">
                  {f.rows ? (
                    <textarea
                      value={row[f.key] ?? ""}
                      onChange={(e) => set(i, f.key, e.target.value)}
                      rows={f.rows}
                      placeholder={f.placeholder}
                      className={subInputCls + " min-w-0 flex-1"}
                    />
                  ) : (
                    <input
                      value={row[f.key] ?? ""}
                      onChange={(e) => set(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={subInputCls + " min-w-0 flex-1"}
                    />
                  )}
                  {onBrowse && fi === 0 && (
                    <button type="button" onClick={() => onBrowse(i)} className={ghostBtnCls}>
                      Browse
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className={rmBtnCls}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, emptyRow(fields)])} className={addBtnCls}>
        {addLabel}
      </button>
    </div>
  );
}

export function JsonRows({
  name,
  initial,
  fields,
  addLabel,
  emptyValue,
  onValue,
}: {
  name: string;
  initial: string;
  fields: SubField[];
  addLabel: string;
  emptyValue: string;
  onValue?: (json: string) => void;
}) {
  const [items, setItems] = useState<Record<string, string>[]>(() => {
    const v = safeParse<unknown>(initial, []);
    return Array.isArray(v) ? v.map((r: unknown) => rowFromJson(r, fields)) : [];
  });
  const cleaned = cleanRows(items, fields);
  const json = cleaned.length > 0 ? JSON.stringify(cleaned) : emptyValue;
  useEffect(() => {
    onValue?.(json);
  }, [json, onValue]);
  return (
    <div>
      <EditableRows items={items} onChange={setItems} fields={fields} addLabel={addLabel} />
      <input type="hidden" name={name} value={json} />
    </div>
  );
}

function PickerUpload({ onDone }: { onDone: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef(false);
  const [state, act, pending] = useActionState(uploadMedia, { ok: false });
  useEffect(() => {
    if (state.ok && !doneRef.current) {
      doneRef.current = true;
      formRef.current?.reset();
      onDone();
    }
  }, [state.ok, onDone]);
  return (
    <form ref={formRef} action={act} className="flex flex-wrap items-end gap-3 rounded-xl border border-olive/25 bg-espresso/60 p-4">
      <div className="min-w-0 flex-1 basis-40">
        <label className={subLabelCls}>Upload new image</label>
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          required
          className="w-full cursor-pointer rounded-lg border border-olive/35 bg-espresso px-3 py-2 font-body text-xs text-ivory/70 file:mr-3 file:rounded-md file:border-0 file:bg-sienna-bright file:px-3 file:py-1 file:font-display file:text-[11px] file:font-semibold file:text-espresso"
        />
      </div>
      <div className="min-w-0 flex-1 basis-40">
        <label className={subLabelCls}>Alt text</label>
        <input
          name="alt"
          type="text"
          placeholder="Describe the image"
          className={subInputCls}
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary !px-4 !py-2 !text-xs disabled:opacity-50">
        {pending ? "Uploading..." : "Upload"}
      </button>
      {state.error && (
        <p role="alert" className="w-full font-body text-xs text-red-300">{state.error}</p>
      )}
    </form>
  );
}

export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (url: string) => void }) {
  const [files, setFiles] = useState<MediaItem[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!open) return;
    listMedia()
      .then((r) => {
        setFiles(r);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [open ]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open , onClose]);
  if (!open) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose image"
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-olive/25 bg-umber shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-olive/20 px-5 py-4">
          <p className="font-display text-base font-semibold text-ivory">Media library</p>
          <button type="button" onClick={onClose} className={ghostBtnCls}>
            Close
          </button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <PickerUpload onDone={() => {
            listMedia().then((r) => setFiles(r)).catch(() => setFailed(true));
          }} />
          {failed && (
            <p role="alert" className="font-body text-xs text-red-300">Could not load the media library.</p>
          )}
          {!failed && files.length === 0 && (
            <p className="font-body text-sm text-ivory/45">No uploads yet - upload one above.</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  onPick(f.url);
                  onClose();
                }}
                className="group overflow-hidden rounded-xl border border-olive/25 text-left transition-colors hover:border-sienna-bright/70"
              >
                {f.mime && f.mime.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.alt ?? ""} loading="lazy" className="h-24 w-full object-cover" />
                ) : (
                  <div className="flex h-24 items-center justify-center font-body text-xs text-ivory/40">File</div>
                )}
                <span className="block truncate px-2.5 py-2 font-mono text-[11px] text-ivory/60">{f.url}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ImageField({ name, initial, onValue }: { name: string; initial: string; onValue?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex gap-2">
        <input
          name={name}
          value={value}
          onChange={(e) => { const v = e.target.value; setValue(v); onValue?.(v); }}
          placeholder="/uploads/..."
          className="w-full min-w-0 flex-1 rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none"
        />
        <button type="button" onClick={() => setOpen(true)} className={ghostBtnCls + " self-center"}>
          Browse
        </button>
      </div>
      {value.trim() !== "" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={value}
          src={value.trim()}
          alt=""
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          className="mt-3 h-28 w-auto max-w-full rounded-lg border border-olive/25 object-cover"
        />
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(u) => { setValue(u); onValue?.(u); }} />
    </div>
  );
}

export function ImageRows({ name, initial, secondKey, secondLabel, onValue }: { name: string; initial: string; secondKey: string; secondLabel: string; onValue?: (json: string) => void }) {
  const fields: SubField[] = [
    { key: "src", label: "Image", placeholder: "/uploads/... or Browse" },
    { key: secondKey, label: secondLabel, rows: 2, placeholder: "Caption or alt text" },
  ];
  const [items, setItems] = useState<Record<string, string>[]>(() => {
    const v = safeParse<unknown>(initial, []);
    return Array.isArray(v) ? v.map((r: unknown) => rowFromJson(r, fields)) : [];
  });
  const [pick, setPick] = useState<number | null>(null);
  const cleaned = cleanRows(items, fields);
  const json = cleaned.length > 0 ? JSON.stringify(cleaned) : "[]";
  useEffect(() => {
    onValue?.(json);
  }, [json, onValue]);
  return (
    <div>
      <EditableRows items={items} onChange={setItems} fields={fields} addLabel="Add image" onBrowse={(i) => setPick(i)} />
      <MediaPicker
        open={pick !== null}
        onClose={() => setPick(null)}
        onPick={(url) => {
          if (pick !== null) setItems(items.map((r, j) => (j === pick ? { ...r, src: url } : r)));
        }}
      />
      <input type="hidden" name={name} value={json} />
    </div>
  );
}

function ProofStatBox({ name, initial }: { name: string; initial: string }) {
  const [row, setRow] = useState<Record<string, string>>(() => rowFromJson(safeParse<unknown>(initial, {}), STAT_FIELDS));
  const empty = !row.value.trim() && !row.label.trim();
  return (
    <div className={rowCls}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={subLabelCls}>Value</label>
          <input
            value={row.value}
            onChange={(e) => setRow({ ...row, value: e.target.value })}
            placeholder="+42%"
            className={subInputCls}
          />
        </div>
        <div>
          <label className={subLabelCls}>Label</label>
          <input
            value={row.label}
            onChange={(e) => setRow({ ...row, label: e.target.value })}
            placeholder="avg. brand-recall lift"
            className={subInputCls}
          />
        </div>
      </div>
      <input
        type="hidden"
        name={name}
        value={empty ? "{}" : JSON.stringify({ value: row.value.trim(), label: row.label.trim() })}
      />
    </div>
  );
}

export function MetaBox({ name, initial, onValue }: { name: string; initial: string; onValue?: (json: string) => void }) {
  const [s, setS] = useState(() => {
    const o = safeParse<Record<string, unknown>>(initial, {});
    const src = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return {
      overview: typeof src.overview === "string" ? src.overview : "",
      obstacles: Array.isArray(src.obstacles) ? src.obstacles.map((r: unknown) => rowFromJson(r, OBSTACLE_FIELDS)) : [],
      toolbox: linesToText(src.toolbox),
      deliverables: linesToText(src.deliverables),
      faqs: Array.isArray(src.faqs) ? src.faqs.map((r: unknown) => rowFromJson(r, QA_FIELDS)) : [],
    };
  });
  const obstacles = cleanRows(s.obstacles, OBSTACLE_FIELDS);
  const faqs = cleanRows(s.faqs, QA_FIELDS);
  const toolbox = textToLines(s.toolbox);
  const deliverables = textToLines(s.deliverables);
  const empty =
    !s.overview.trim() && obstacles.length === 0 && faqs.length === 0 && toolbox.length === 0 && deliverables.length === 0;
  const json = empty ? "null" : JSON.stringify({ overview: s.overview.trim(), obstacles, toolbox, deliverables, faqs });
  useEffect(() => {
    onValue?.(json);
  }, [json, onValue]);
  return (
    <div className="space-y-5">
      <div>
        <label className={subLabelCls}>Overview</label>
        <textarea
          value={s.overview}
          onChange={(e) => setS({ ...s, overview: e.target.value })}
          placeholder="One-paragraph case summary"
          rows={3}
          className={subInputCls}
        />
      </div>
      <div>
        <label className={subLabelCls}>Obstacles</label>
        <EditableRows items={s.obstacles} onChange={(v) => setS({ ...s, obstacles: v })} fields={OBSTACLE_FIELDS} addLabel="Add obstacle" />
      </div>
      <div>
        <label className={subLabelCls}>Toolbox - one tool per line</label>
        <textarea
          value={s.toolbox}
          onChange={(e) => setS({ ...s, toolbox: e.target.value })}
          placeholder="One tool per line"
          rows={3}
          className={subInputCls}
        />
      </div>
      <div>
        <label className={subLabelCls}>Deliverables - one per line</label>
        <textarea
          value={s.deliverables}
          onChange={(e) => setS({ ...s, deliverables: e.target.value })}
          placeholder="One deliverable per line"
          rows={3}
          className={subInputCls}
        />
      </div>
      <div>
        <label className={subLabelCls}>FAQs</label>
        <EditableRows items={s.faqs} onChange={(v) => setS({ ...s, faqs: v })} fields={QA_FIELDS} addLabel="Add question" />
      </div>
      <input
        type="hidden"
        name={name}
        value={json}
      />
    </div>
  );
}

function JobBox({ name, initial }: { name: string; initial: string }) {
  const [s, setS] = useState(() => {
    const o = safeParse<Record<string, unknown>>(initial, {});
    const src = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      about: str(src.about),
      responsibilities: linesToText(src.responsibilities),
      requirements: linesToText(src.requirements),
      niceToHave: linesToText(src.niceToHave),
      success90: str(src.success90),
    };
  });
  const responsibilities = textToLines(s.responsibilities);
  const requirements = textToLines(s.requirements);
  const niceToHave = textToLines(s.niceToHave);
  const empty =
    !s.about.trim() && !s.success90.trim() && responsibilities.length === 0 && requirements.length === 0 && niceToHave.length === 0;
  return (
    <div className="space-y-5">
      <div>
        <label className={subLabelCls}>About the role</label>
        <textarea value={s.about} onChange={(e) => setS({ ...s, about: e.target.value })} placeholder="What this role owns" rows={3} className={subInputCls} />
      </div>
      <div>
        <label className={subLabelCls}>Responsibilities - one per line</label>
        <textarea value={s.responsibilities} onChange={(e) => setS({ ...s, responsibilities: e.target.value })} placeholder="One responsibility per line" rows={4} className={subInputCls} />
      </div>
      <div>
        <label className={subLabelCls}>Requirements - one per line</label>
        <textarea value={s.requirements} onChange={(e) => setS({ ...s, requirements: e.target.value })} placeholder="One requirement per line" rows={4} className={subInputCls} />
      </div>
      <div>
        <label className={subLabelCls}>Nice to have - one per line</label>
        <textarea value={s.niceToHave} onChange={(e) => setS({ ...s, niceToHave: e.target.value })} placeholder="One per line (optional)" rows={3} className={subInputCls} />
      </div>
      <div>
        <label className={subLabelCls}>Success in 90 days</label>
        <textarea value={s.success90} onChange={(e) => setS({ ...s, success90: e.target.value })} placeholder="What good looks like after 90 days" rows={2} className={subInputCls} />
      </div>
      <input
        type="hidden"
        name={name}
        value={
          empty
            ? "null"
            : JSON.stringify({
                about: s.about.trim(),
                responsibilities,
                requirements,
                niceToHave,
                success90: s.success90.trim(),
              })
        }
      />
    </div>
  );
}

export function FaqEditor({ name, initial, onValue }: { name: string; initial: string; onValue?: (json: string) => void }) {
  return <JsonRows name={name} initial={initial} fields={QA_FIELDS} addLabel="Add question" emptyValue="[]" onValue={onValue} />;
}

function JsonField({ field, initial }: { field: FieldDef; initial: string }) {
  switch (field.editor) {
    case "qa":
      return <FaqEditor name={field.name} initial={initial} />;
    case "imagelist":
      return <ImageRows name={field.name} initial={initial} secondKey={field.altKey ?? "alt"} secondLabel={field.altLabel ?? "Alt text"} />;
    case "stats":
      return <JsonRows name={field.name} initial={initial} fields={STAT_FIELDS} addLabel="Add stat" emptyValue="[]" />;
    case "proofstat":
      return <ProofStatBox name={field.name} initial={initial} />;
    case "process":
      return <JsonRows name={field.name} initial={initial} fields={PROCESS_FIELDS} addLabel="Add step" emptyValue="[]" />;
    case "story":
      return <JsonRows name={field.name} initial={initial} fields={STORY_FIELDS} addLabel="Add act" emptyValue="null" />;
    case "meta":
      return <MetaBox name={field.name} initial={initial} />;
    case "jobdetail":
      return <JobBox name={field.name} initial={initial} />;
    default:
      return (
        <textarea
          name={field.name}
          defaultValue={initial}
          rows={field.rows ?? 4}
          className="w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-mono text-[13px] text-ivory focus:border-sienna-bright/70 focus:outline-none"
        />
      );
  }
}

function FieldInput({ field, initial }: { field: FieldDef; initial: string }) {
  const cls =
    "w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
  if (field.kind === "json") {
    return <JsonField field={field} initial={initial} />;
  }
  if (field.kind === "textarea" || field.kind === "list") {
    return (
      <textarea
        name={field.name}
        defaultValue={initial}
        rows={field.rows ?? 4}
        placeholder={field.help}
        className={cls}
      />
    );
  }
  if (field.kind === "number") {
    return <input name={field.name} type="number" defaultValue={initial} className={cls} />;
  }
  if (field.kind === "checkbox") {
    return (
      <input
        name={field.name}
        type="checkbox"
        defaultChecked={initial === "true"}
        className="h-5 w-5 accent-[#ff5001]"
      />
    );
  }
  if (field.kind === "select") {
    return (
      <select name={field.name} defaultValue={initial} className={cls}>
        {(field.options ?? []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }
  if (field.kind === "image") {
    return <ImageField name={field.name} initial={initial} />;
  }
  return (
    <input
      name={field.name}
      type="text"
      defaultValue={initial}
      required={field.required}
      className={cls}
    />
  );
}

export function EditorForm({
  collection,
  id,
  fields,
  initial,
  viewHref,
}: {
  collection: CollectionKey;
  id: string;
  fields: FieldDef[];
  initial: Record<string, string>;
  viewHref?: string;
}) {
  const router = useRouter();
  const [state, act, pending] = useActionState(saveItem.bind(null, collection, id), {
    ok: false,
  });
  useEffect(() => {
    if (state.ok) {
      router.push(`/admin/${collection}`);
      router.refresh();
    }
  }, [state.ok, router, collection]);
  return (
    <form action={act} className="space-y-6">
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={`f-${f.name}`} className="mb-2 block font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50">
            {f.label}
            {f.required && <span className="text-sienna-bright"> *</span>}
          </label>
          <div id={`f-${f.name}`}>
            <FieldInput field={f} initial={initial[f.name] ?? ""} />
          </div>
          {f.help && (
            <p className="mt-1.5 font-body text-xs text-ivory/35">{f.help}</p>
          )}
        </div>
      ))}
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300">
          {state.error}
        </p>
      )}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-olive/25 bg-espresso/90 p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
          {pending ? "Saving..." : id === "new" ? "Create" : "Save changes"}
        </button>
        {viewHref && id !== "new" && (
          <a href={viewHref} target="_blank" rel="noreferrer" className="btn btn-secondary">
            View on site
          </a>
        )}
      </div>
    </form>
  );
}export function DuplicateButton({ collection, id }: { collection: CollectionKey; id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        const { duplicateItem } = await import("./actions");
        setBusy(true);
        await duplicateItem(collection, id);
        setBusy(false);
        router.refresh();
      }}
      className="rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/75 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright disabled:opacity-40"
    >
      {busy ? "Duplicating..." : "Duplicate"}
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="rounded-lg border border-olive/35 px-3 py-1.5 font-body text-xs text-ivory/65 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright"
    >
      {done ? "Copied" : "Copy URL"}
    </button>
  );
}

export function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, act, pending] = useActionState(uploadMedia, { ok: false });
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);
  return (
    <form ref={formRef} action={act} className="flex flex-wrap items-end gap-4">
      <div>
        <label htmlFor="media-file" className="mb-2 block font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50">
          Image (JPG, PNG, WebP, SVG - max 5 MB)
        </label>
        <input
          id="media-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          required
          className="w-full cursor-pointer rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory/70 file:mr-4 file:rounded-md file:border-0 file:bg-sienna-bright file:px-4 file:py-1.5 file:font-display file:text-xs file:font-semibold file:text-espresso"
        />
      </div>
      <div>
        <label htmlFor="media-alt" className="mb-2 block font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50">
          Alt text (for SEO)
        </label>
        <input
          id="media-alt"
          name="alt"
          type="text"
          placeholder="Describe the image"
          className="w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none"
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
        {pending ? "Uploading..." : "Upload"}
      </button>
      {state.error && (
        <p role="alert" className="font-body text-sm text-red-300">{state.error}</p>
      )}
    </form>
  );
}

export function LeadRowButtons({ id, read }: { id: number; read: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError("");
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Failed.");
      else router.refresh();
    });
  };
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setLeadRead(id, !read))}
        className="rounded-lg border border-olive/35 px-3 py-1.5 font-body text-xs text-ivory/65 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright disabled:opacity-40"
      >
        {read ? "Mark unread" : "Mark read"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this lead?")) return;
          run(() => deleteLead(id));
        }}
        className="rounded-lg border border-red-400/40 px-3 py-1.5 font-body text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-40"
      >
        Delete
      </button>
      {error && <span className="font-body text-xs text-red-300">{error}</span>}
    </div>
  );
}

export function MediaDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        const { deleteMedia } = await import("./actions");
        if (!window.confirm("Delete this file? Pages using its URL will break.")) return;
        setBusy(true);
        await deleteMedia(id);
        setBusy(false);
        router.refresh();
      }}
      className="rounded-lg border border-red-400/40 px-3 py-1.5 font-body text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-40"
    >
      {busy ? "..." : "Delete"}
    </button>
  );
}