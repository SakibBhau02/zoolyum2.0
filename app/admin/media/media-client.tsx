"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMedia, updateMediaAlt, uploadMedia } from "../actions";
import { Icon } from "../_ui/icons";

export function UploadPanel() {
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
    <form ref={formRef} action={act} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <label htmlFor="media-file" className="a-label">File</label>
        <input
          id="media-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          required
          className="w-full cursor-pointer rounded-[9px] border border-[var(--a-line-strong)] bg-[#171310] px-3 py-2 text-[12px] text-[var(--a-muted)] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[var(--a-accent)] file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-[#1a1109]"
        />
        <p className="a-help">JPG, PNG, WebP or SVG. Max 5 MB. The real file type is verified server-side.</p>
      </div>
      <div className="min-w-[200px] flex-1">
        <label htmlFor="media-alt" className="a-label">Alt text</label>
        <input id="media-alt" name="alt" placeholder="Describe the image for screen readers" className="a-input" />
      </div>
      <button type="submit" disabled={pending} className="a-btn a-btn-primary">
        {pending ? "Uploading..." : "Upload"}
      </button>
      {state.error && (
        <p role="alert" className="w-full text-[11.5px] text-[var(--a-bad)]">{state.error}</p>
      )}
    </form>
  );
}

export function MediaCard({
  file,
  canDelete,
}: {
  file: { id: number; url: string; alt: string | null; mime: string | null; size: number | null; width: number | null; height: number | null };
  canDelete: boolean;
}) {
  const router = useRouter();
  const [alt, setAlt] = useState(file.alt ?? "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const dirty = alt !== (file.alt ?? "");

  async function saveAlt() {
    setBusy(true);
    setError("");
    const r = await updateMediaAlt(file.id, alt);
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Could not save alt text.");
    else {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <div className="a-card overflow-hidden">
      <div className="relative">
        {file.mime?.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.url} alt={file.alt ?? ""} className="h-40 w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-40 items-center justify-center text-[11px] text-[var(--a-faint)]">Not an image</div>
        )}
        {!file.alt && (
          <span className="absolute left-2 top-2 rounded-full bg-[rgba(242,181,68,0.95)] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#2a1c09]">
            No alt
          </span>
        )}
      </div>
      <div className="space-y-2 p-3.5">
        <p className="a-mono truncate text-[10.5px] text-[var(--a-muted)]" title={file.url}>{file.url}</p>

        {editing ? (
          <div>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Alt text"
              className="a-input !py-1.5 !text-[12px]"
              aria-label="Alt text"
            />
            <div className="mt-1.5 flex gap-1.5">
              <button type="button" disabled={busy || !dirty} onClick={saveAlt} className="a-btn a-btn-sm a-btn-primary">
                {busy ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => { setAlt(file.alt ?? ""); setEditing(false); }} className="a-btn a-btn-sm a-btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="block w-full truncate text-left text-[11.5px] text-[var(--a-muted)] hover:text-[var(--a-accent)]">
            {file.alt || "Add alt text"}
          </button>
        )}

        <p className="a-faint text-[10.5px]">
          {file.size ? (file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`) : "—"}
          {file.width ? ` · ${file.width}×${file.height}` : ""}
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="a-btn a-btn-sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(file.url);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                setError("Clipboard unavailable.");
              }
            }}
          >
            <Icon name="copy" className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy URL"}
          </button>
          {canDelete && (
            <button
              type="button"
              disabled={busy}
              className="a-btn a-btn-sm a-btn-danger"
              onClick={async () => {
                if (!window.confirm("Delete this file? Pages using its URL will break.")) return;
                setBusy(true);
                await deleteMedia(file.id);
                setBusy(false);
                router.refresh();
              }}
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {error && <p role="alert" className="text-[10.5px] text-[var(--a-bad)]">{error}</p>}
      </div>
    </div>
  );
}
