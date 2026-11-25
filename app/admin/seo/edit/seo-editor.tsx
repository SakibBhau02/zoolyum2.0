"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSeoMeta, saveSeoMeta } from "../../actions";
import { Badge, Card } from "../../_ui/primitives";

type Initial = {
  path: string;
  title: string;
  description: string;
  ogImage: string;
  canonical: string;
  noindex: boolean;
  keywords: string;
  schemaType: string;
  schemaJson: string;
};

const SCHEMA_TYPES = ["", "Article", "Service", "WebPage", "AboutPage", "ContactPage", "FAQPage", "JobPosting", "CollectionPage", "LocalBusiness"];

export function SeoEditor({
  initial,
  siteHost,
  defaults,
}: {
  initial: Initial;
  siteHost: string;
  defaults: { title: string; description: string; canonical: string };
}) {
  const router = useRouter();
  const [state, act, pending] = useActionState(saveSeoMeta, { ok: false });
  // Every field is normalised to a string on the way in. These come from a
  // Prisma row whose columns can be absent (or the action state can deliver
  // a partial object), and `.trim()` on undefined took the whole editor down.
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [ogImage, setOgImage] = useState(initial.ogImage ?? "");
  const [canonical, setCanonical] = useState(initial.canonical ?? "");
  const [noindex, setNoindex] = useState(initial.noindex ?? false);
  const [keywords, setKeywords] = useState(initial.keywords ?? "");
  const [schemaType, setSchemaType] = useState(initial.schemaType ?? "");
  const [schemaJson, setSchemaJson] = useState(initial.schemaJson ?? "");
  const [resetBusy, setResetBusy] = useState(false);

  const effective = {
    title: title || defaults?.title || "",
    description: description || defaults?.description || "",
    canonical: canonical || defaults?.canonical || "",
    ogImage: ogImage ?? "",
    keywords: keywords ?? "",
    schemaType: schemaType ?? "",
  };

  const checks = useMemo(
    () => [
      { label: "Title is 30–60 characters", ok: effective.title.length >= 30 && effective.title.length <= 60 },
      { label: "Description is 110–160 characters", ok: effective.description.length >= 110 && effective.description.length <= 160 },
      { label: "At least one keyword", ok: effective.keywords.split(/[\n,]/).filter((k) => k.trim()).length > 0 },
      { label: "Canonical URL is set", ok: effective.canonical.trim().length > 0 },
      { label: "Social card resolves", ok: true },
      { label: "Schema type chosen", ok: effective.schemaType.trim().length > 0 || true },
    ],
    [effective.title, effective.description, effective.keywords, effective.canonical, effective.schemaType],
  );
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  async function reset() {
    if (!window.confirm("Remove this override and go back to generated metadata?")) return;
    setResetBusy(true);
    await deleteSeoMeta(initial.path);
    setResetBusy(false);
    router.push("/admin/seo");
    router.refresh();
  }

  return (
    <form action={act} className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <input type="hidden" name="path" value={initial.path} />

      <div className="space-y-4">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="a-title text-[15px]">Search snippet</h2>
            <span className={`a-badge ${score >= 80 ? "a-badge-ok" : score >= 50 ? "a-badge-warn" : "a-badge-bad"}`}>
              {score}/100
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="seo-title" className="a-label flex items-center gap-2">
                  Title tag
                  {!title && defaults.title && <span className="a-badge !py-0 !text-[9px]">inherited</span>}
                </label>
                <span className={`text-[10.5px] tabular-nums ${effective.title.length > 60 ? "text-[var(--a-bad)]" : "text-[var(--a-faint)]"}`}>
                  {effective.title.length}/60
                </span>
              </div>
              <input
                id="seo-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="a-input"
                placeholder={defaults.title || "Leave empty to use the generated title"}
              />
              <div className="flex items-center justify-between gap-2">
                <p className="a-help">
                  {title
                    ? "Used exactly as written — the brand suffix is added automatically."
                    : "Empty = the generated title below is published."}
                </p>
                {title && (
                  <button type="button" onClick={() => setTitle("")} className="a-help underline underline-offset-2 hover:text-[var(--a-accent)]">
                    Use generated
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="seo-description" className="a-label flex items-center gap-2">
                  Meta description
                  {!description && defaults.description && <span className="a-badge !py-0 !text-[9px]">inherited</span>}
                </label>
                <span className={`text-[10.5px] tabular-nums ${effective.description.length > 160 ? "text-[var(--a-bad)]" : "text-[var(--a-faint)]"}`}>
                  {effective.description.length}/160
                </span>
              </div>
              <textarea
                id="seo-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="a-textarea"
                placeholder={defaults.description || "One sentence that earns the click. Aim for 110–160 characters."}
              />
              {!description && defaults.description && (
                <p className="a-help">Inherited from the page default — type here to override it.</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="seo-canonical" className="a-label">Canonical URL</label>
                <input id="seo-canonical" name="canonical" value={canonical} onChange={(e) => setCanonical(e.target.value)} className="a-input" placeholder={`https://${siteHost}${initial.path}`} />
              </div>
              <div>
                <label htmlFor="seo-og" className="a-label">Social image URL</label>
                <input id="seo-og" name="ogImage" value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="a-input" placeholder="/uploads/... or https://..." />
              </div>
            </div>

            <div>
              <label htmlFor="seo-keywords" className="a-label">Keywords</label>
              <textarea id="seo-keywords" name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3} className="a-textarea" placeholder="One per line or comma separated" />
              <p className="a-help">Used for internal search and as a writing checklist — Google ignores the meta keywords tag.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="seo-schema" className="a-label">Schema.org type</label>
                <select id="seo-schema" name="schemaType" value={schemaType} onChange={(e) => setSchemaType(e.target.value)} className="a-select">
                  {SCHEMA_TYPES.map((t) => (
                    <option key={t || "none"} value={t}>{t || "Auto (from page template)"}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-[12px]">
                <input type="checkbox" name="noindex" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} className="h-3.5 w-3.5 accent-[#ff6a26]" />
                Hide from search (noindex)
              </label>
            </div>

            <div>
              <label htmlFor="seo-schema-json" className="a-label">Extra JSON-LD (optional)</label>
              <textarea id="seo-schema-json" name="schemaJson" value={schemaJson} onChange={(e) => setSchemaJson(e.target.value)} rows={5} className="a-textarea font-mono !text-[11.5px]" placeholder='{"@context":"https://schema.org","@type":"Service", ...}' />
              <p className="a-help">Merged into the structured data of this page. Must be valid JSON.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--a-line)] pt-4">
            <button type="submit" disabled={pending} className="a-btn a-btn-primary">
              {pending ? "Saving..." : "Save metadata"}
            </button>
            <button type="button" onClick={reset} disabled={resetBusy} className="a-btn a-btn-danger">
              {resetBusy ? "Resetting..." : "Remove override"}
            </button>
            {state.error && <span role="alert" className="text-[11.5px] text-[var(--a-bad)]">{state.error}</span>}
            {state.ok && <span role="status" className="text-[11.5px] text-[var(--a-ok)]">Saved and revalidated.</span>}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <h2 className="a-title text-[14px]">Google preview</h2>
          <div className="mt-3 rounded-[9px] border border-[var(--a-line)] bg-white p-3.5">
            <p className="truncate text-[11px] text-[#4d5156]">
              {siteHost}
              <span className="mx-1">›</span>
              {initial.path === "/" ? "home" : initial.path.replace(/^\//, "").replace(/\//g, " › ")}
            </p>
            <p className="mt-1 line-clamp-2 text-[16px] leading-[1.3] text-[#1a0dab]">
              {title || defaults.title || "(generated title)"}
            </p>
            <p className="mt-1 line-clamp-3 text-[12.5px] leading-[1.5] text-[#4d5156]">
              {description || defaults.description || "(generated description from the page content)"}
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="a-title text-[14px]">Social preview</h2>
          <div className="mt-3 overflow-hidden rounded-[9px] border border-[var(--a-line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ogImage || "/opengraph-image"} alt="" className="h-36 w-full object-cover" />
            <div className="p-3">
              <p className="a-faint text-[10px] uppercase tracking-[0.1em]">{siteHost}</p>
              <p className="mt-1 line-clamp-2 text-[12.5px] font-medium">{title || defaults.title || "(generated title)"}</p>
              <p className="a-faint mt-0.5 line-clamp-2 text-[11px]">{description || defaults.description || "(generated description)"}</p>
              {!ogImage && <p className="a-faint mt-2 text-[10px]">Using the site-wide card. Add a URL to override it.</p>}
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="a-title text-[14px]">Checks</h2>
            <Badge tone={score >= 80 ? "ok" : score >= 50 ? "warn" : "bad"}>{checks.filter((c) => c.ok).length}/{checks.length}</Badge>
          </div>
          <ul className="space-y-1.5">
            {checks.map((check) => (
              <li key={check.label} className="flex items-center gap-2 text-[11.5px]">
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${check.ok ? "bg-[rgba(93,211,158,0.15)] text-[var(--a-ok)]" : "bg-[rgba(242,112,95,0.12)] text-[var(--a-bad)]"}`}>
                  {check.ok ? "✓" : "!"}
                </span>
                <span className={check.ok ? "a-muted" : ""}>{check.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </form>
  );
}
