import { prisma } from "@/lib/prisma";
import { CopyButton, MediaDeleteButton, UploadForm } from "../ui";

function kb(size: number | null) {
  if (!size) return "";
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(size / 1024)} KB`;
}

export default async function MediaPage() {
  const files = await prisma.media.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Studio</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ivory">Media library<span className="text-sienna">.</span></h1>
      <div className="card-surface mt-8 p-6">
        <UploadForm />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.length === 0 && (
          <p className="font-body text-sm text-ivory/45">No uploads yet.</p>
        )}
        {files.map((f) => (
          <div key={f.id} className="card-surface overflow-hidden">
            {f.mime?.startsWith("image/") && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt={f.key} className="h-36 w-full object-cover" loading="lazy" />
            )}
            <div className="space-y-2 p-4">
              <p className="truncate font-mono text-xs text-ivory/60" title={f.url}>{f.url}</p>
              <p className="font-body text-xs text-ivory/40">{kb(f.size)}{f.width ? ` · ${f.width}x${f.height}` : ""}</p>
              <div className="flex gap-2">
                <CopyButton text={f.url} />
                <MediaDeleteButton id={f.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}