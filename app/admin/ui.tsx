"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  loginAction,
  saveItem,
  deleteItem,
  uploadMedia,
  setLeadRead,
  deleteLead,
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

function FieldInput({ field, initial }: { field: FieldDef; initial: string }) {
  const cls =
    "w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
  if (field.kind === "textarea" || field.kind === "list" || field.kind === "json") {
    return (
      <textarea
        name={field.name}
        defaultValue={initial}
        rows={field.rows ?? 4}
        placeholder={field.help}
        className={`${cls} ${field.kind === "json" ? "font-mono text-[13px]" : ""}`}
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
          {f.help && f.kind !== "json" && f.kind !== "textarea" && f.kind !== "list" && (
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