"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveItem } from "./actions";
import { ImageField, ImageRows, FaqEditor } from "./ui";
import type { CollectionKey } from "./config";

export type PostAuthorOpt = { name: string; role: string };

type Level = "ok" | "warn" | "bad";
type Check = { label: string; detail: string; level: Level };

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function Dot({ level }: { level: Level }) {
  const c = level === "ok" ? "bg-emerald-400" : level === "warn" ? "bg-amber-400" : "bg-red-400";
  return <span aria-hidden="true" className={"h-2 w-2 shrink-0 rounded-full " + c} />;
}

function lenCheck(n: number, lo: number, hi: number, emptyAs: Level): Level {
  if (n === 0) return emptyAs;
  if (n >= lo && n <= hi) return "ok";
  if (n >= lo - 10 && n <= hi + 10) return "warn";
  return "bad";
}

const fieldCls =
  "w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
const miniLabelCls =
  "mb-2 block font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50";
const cardCls = "card-surface p-6";
const cardTitleCls = "font-display text-base font-semibold text-ivory";
const iconBtnCls =
  "rounded-lg border border-olive/35 px-2.5 py-1.5 font-body text-xs text-ivory/60 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright disabled:opacity-30";

export function PostEditor({
  collection,
  id,
  initial,
  isNew,
  categories,
  authors,
  siteUrl,
  viewHref,
}: {
  collection: CollectionKey;
  id: string;
  initial: Record<string, string>;
  isNew: boolean;
  categories: string[];
  authors: PostAuthorOpt[];
  siteUrl: string;
  viewHref?: string;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugTouched, setSlugTouched] = useState((initial.slug ?? "") !== "");
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [date, setDate] = useState(initial.date !== "" ? initial.date : isNew ? today : "");
  const [updated, setUpdated] = useState(initial.updated ?? "");
  const [readTime, setReadTime] = useState(initial.readTime ?? "");
  const [author, setAuthor] = useState(initial.author ?? "");
  const [authorRole, setAuthorRole] = useState(initial.authorRole ?? "");
  const [roleTouched, setRoleTouched] = useState((initial.authorRole ?? "") !== "");
  const [published, setPublished] = useState(initial.published === "true");
  const [quote, setQuote] = useState(initial.quote ?? "");
  const [keywordsText, setKeywordsText] = useState(initial.keywords ?? "");
  const [takeawaysText, setTakeawaysText] = useState(initial.takeaways ?? "");
  const [paras, setParas] = useState<string[]>(() => {
    const raw = initial.body && initial.body !== "" ? initial.body.split("\n\n") : [""];
    return raw.map((r) => (r.startsWith("## ") ? r.slice(3) : r));
  });
  const [heads, setHeads] = useState<boolean[]>(() => {
    const raw = initial.body && initial.body !== "" ? initial.body.split("\n\n") : [""];
    return raw.map((r) => r.startsWith("## ") && r.slice(3).trim() !== "");
  });
  const [focusKw, setFocusKw] = useState(() =>
    (initial.keywords ?? "").split("\n").map((s) => s.trim()).filter(Boolean)[0] ?? "",
  );
  const [coverVal, setCoverVal] = useState(initial.cover ?? "");
  const [imagesJson, setImagesJson] = useState(initial.images && initial.images !== "" ? initial.images : "[]");
  const [faqsJson, setFaqsJson] = useState(initial.faqs && initial.faqs !== "" ? initial.faqs : "[]");

  const [state, act, pending] = useActionState(saveItem.bind(null, collection, id), { ok: false });
  useEffect(() => {
    if (state.ok) {
      router.push("/admin/" + collection);
      router.refresh();
    }
  }, [state.ok, router, collection]);

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };
  const onAuthor = (v: string) => {
    setAuthor(v);
    if (!roleTouched) {
      const hit = authors.find((a) => a.name.toLowerCase() === v.trim().toLowerCase());
      if (hit) setAuthorRole(hit.role);
    }
  };

  const setPara = (i: number, v: string) => setParas(paras.map((p, j) => (j === i ? v : p)));
  const movePara = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= paras.length) return;
    const next = paras.slice();
    next[i] = paras[j];
    next[j] = paras[i];
    setParas(next);
    const nextH = heads.slice();
    nextH[i] = heads[j];
    nextH[j] = heads[i];
    setHeads(nextH);
  };
  const toggleHead = (i: number) => setHeads(heads.map((h, j) => (j === i ? !h : h)));
  const removePara = (i: number) => {
    setParas(paras.filter((_, j) => j !== i));
    setHeads(heads.filter((_, j) => j !== i));
  };

  const bodyText = useMemo(() => paras.join(" "), [paras]);
  const bodyWords = useMemo(() => bodyText.split(/\s+/).filter(Boolean).length, [bodyText]);
  const autoRead = Math.max(1, Math.round(bodyWords / 200)) + " min";
  const sectionOf = (index: number): number => {
    let s = 0;
    for (let i = 0; i < index; i += 1) {
      if (heads[i]) s += 1;
    }
    return s;
  };

  const checks = useMemo(() => {
    const kw = focusKw.trim();
    const kwl = kw.toLowerCase();
    const slugKw = slugify(kw);
    const firstPara = paras.map((p) => p.trim()).find((p) => p !== "") ?? "";
    const first100 = firstPara.split(/\s+/).filter(Boolean).slice(0, 100).join(" ").toLowerCase();
    const lowerBody = bodyText.toLowerCase();
    const occ = kwl !== "" ? lowerBody.split(kwl).length - 1 : 0;
    const density = bodyWords > 0 && kwl !== "" ? (occ / bodyWords) * 100 : 0;
    let imagesArr: { src?: unknown; caption?: unknown; alt?: unknown }[] = [];
    let faqsArr: unknown[] = [];
    try {
      const v: unknown = JSON.parse(imagesJson || "[]");
      if (Array.isArray(v)) imagesArr = v as typeof imagesArr;
    } catch {}
    try {
      const v: unknown = JSON.parse(faqsJson || "[]");
      if (Array.isArray(v)) faqsArr = v;
    } catch {}
    const withCap = imagesArr.filter(
      (g) => typeof g.src === "string" && g.src !== "" && ((typeof g.caption === "string" && g.caption !== "") || (typeof g.alt === "string" && g.alt !== "")),
    ).length;
    const takeLines = takeawaysText.split("\n").map((s) => s.trim()).filter(Boolean);
    const keyLines = keywordsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const headCount = heads.filter((h, i) => h && paras[i].trim() !== "").length;
    const inTitle = kwl !== "" && title.toLowerCase().indexOf(kwl) !== -1;
    const inExcerpt = kwl !== "" && excerpt.toLowerCase().indexOf(kwl) !== -1;
    const kwGroup: Check[] = [
      { label: "Keyword in title", detail: kw === "" ? "Set a focus keyword first" : inTitle ? "Found" : "Missing", level: kw === "" ? "warn" : inTitle ? "ok" : "bad" },
      { label: "Keyword in slug", detail: kw === "" ? "Set a focus keyword first" : slugKw === "" ? "Keyword has no latin slug form" : slug.toLowerCase().indexOf(slugKw) !== -1 ? "Found" : "Missing", level: kw === "" || slugKw === "" ? "warn" : slug.toLowerCase().indexOf(slugKw) !== -1 ? "ok" : "bad" },
      { label: "Keyword in excerpt", detail: kw === "" ? "Set a focus keyword first" : inExcerpt ? "Found" : "Missing", level: kw === "" ? "warn" : inExcerpt ? "ok" : "bad" },
      { label: "Keyword in first 100 words", detail: kw === "" ? "Set a focus keyword first" : first100.indexOf(kwl) !== -1 ? "Found" : "Missing", level: kw === "" ? "warn" : first100.indexOf(kwl) !== -1 ? "ok" : "warn" },
      { label: "Keyword density", detail: kw === "" ? "Set a focus keyword first" : density.toFixed(1) + "% (" + occ + " mentions)", level: kw === "" ? "warn" : density >= 0.5 && density <= 2.5 ? "ok" : "warn" },
    ];
    const seo: Check[] = [
      { label: "Title length", detail: title.length + " chars (50-60 ideal)", level: lenCheck(title.length, 50, 60, "bad") },
      { label: "Excerpt length", detail: excerpt.length + " chars (150-160 ideal)", level: lenCheck(excerpt.length, 150, 160, "bad") },
      ...kwGroup,
      { label: "Cover image", detail: coverVal !== "" ? "Set" : "Missing - hero breaks without it", level: coverVal !== "" ? "ok" : "bad" },
      { label: "Word count", detail: bodyWords + " words (300+ recommended)", level: bodyWords === 0 ? "bad" : bodyWords >= 300 ? "ok" : "warn" },
      { label: "Publish date", detail: date !== "" ? date : "Missing", level: date !== "" ? "ok" : "bad" },
    ];
    const aeo: Check[] = [
      { label: "FAQs", detail: faqsArr.length + " answered (3+ recommended, feeds Google FAQ results)", level: faqsArr.length >= 3 ? "ok" : faqsArr.length > 0 ? "warn" : "warn" },
      { label: "Pull quote", detail: quote.trim() !== "" ? "Set" : "Missing", level: quote.trim() !== "" ? "ok" : "warn" },
      { label: "Takeaways", detail: takeLines.length + " (3+ recommended)", level: takeLines.length >= 3 ? "ok" : "warn" },
      { label: "H2 sections", detail: headCount + " (powers TOC, quote slot and images)", level: headCount > 0 ? "ok" : "warn" },
      { label: "Inline images", detail: withCap + " with caption", level: withCap > 0 ? "ok" : "warn" },
    ];
    const trust: Check[] = [
      { label: "Author", detail: author.trim() !== "" ? author.trim() : "Missing", level: author.trim() !== "" ? "ok" : "warn" },
      { label: "Category", detail: category.trim() !== "" ? category.trim() : "Missing", level: category.trim() !== "" ? "ok" : "warn" },
      { label: "Keywords", detail: keyLines.length + " (3+ recommended)", level: keyLines.length >= 3 ? "ok" : "warn" },
      { label: "Read time", detail: readTime.trim() !== "" ? readTime.trim() + " (auto suggests " + autoRead + ")" : "Empty - auto suggests " + autoRead, level: readTime.trim() !== "" ? "ok" : "warn" },
      { label: "Freshness", detail: updated !== "" ? "Updated " + updated : "No update stamp (fine for new posts)", level: "ok" },
    ];
    return { seo, aeo, trust };
  }, [title, excerpt, slug, focusKw, bodyText, bodyWords, coverVal, date, quote, takeawaysText, keywordsText, paras, imagesJson, faqsJson, author, category, readTime, updated, autoRead]);

  const all: Check[] = [...checks.seo, ...checks.aeo, ...checks.trust];
  const bads = all.filter((c) => c.level === "bad").length;
  const warns = all.filter((c) => c.level === "warn").length;

  const bodyValue = paras
    .map((p, i) => (heads[i] && p.trim() !== "" ? "## " + p.trim() : p.trim()))
    .filter(Boolean)
    .join("\n\n");

  const CheckGroup = ({ title, items }: { title: string; items: Check[] }) => (
    <div>
      <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/40">{title}</p>
      <ul className="space-y-2.5">
        {items.map((c) => (
          <li key={c.label} className="flex items-start gap-2.5">
            <span className="mt-1"><Dot level={c.level} /></span>
            <span>
              <span className="block font-body text-[13px] font-semibold text-ivory/85">{c.label}</span>
              <span className="block font-body text-xs text-ivory/45">{c.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <form action={act} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className={"rounded-full px-3 py-1 font-body text-xs font-semibold " + (published ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300")}>
          {published ? "Published" : "Draft"}
        </span>
        <span className="font-body text-xs text-ivory/45">{bodyWords} words · auto read time {autoRead}</span>
        <span className="ml-auto flex items-center gap-2">
          {viewHref && !isNew && (
            <a href={viewHref} target="_blank" rel="noreferrer" className="btn btn-secondary !px-4 !py-2 !text-xs">
              View on site
            </a>
          )}
          <button type="submit" disabled={pending} className="btn btn-primary !px-5 !py-2 !text-sm disabled:opacity-50">
            {pending ? "Saving..." : isNew ? "Publish post" : "Save changes"}
          </button>
        </span>
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className={cardCls}>
            <label htmlFor="post-title" className={miniLabelCls}>Title (H1) · {title.length}/60</label>
            <input
              id="post-title"
              name="title"
              value={title}
              onChange={(e) => onTitle(e.target.value)}
              required
              placeholder="Why most Bangladeshi brands lose"
              className={fieldCls + " !text-base !font-semibold"}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="post-slug" className={miniLabelCls}>Slug {slugTouched ? "(manual)" : "(auto)"}</label>
                <input
                  id="post-slug"
                  name="slug"
                  value={slug}
                  required
                  onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                  className={fieldCls + " font-mono !text-[13px]"}
                />
              </div>
              <div>
                <span className={miniLabelCls}>URL preview</span>
                <p className="truncate rounded-lg border border-olive/25 bg-espresso/60 px-4 py-2.5 font-mono text-[13px] text-sienna-bright">
                  {siteUrl.replace(/\/$/, "")}/blog/{slug !== "" ? slug : "…"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="post-excerpt" className={miniLabelCls}>Excerpt · doubles as the TL;DR summary AI engines quote · {excerpt.length}/160</label>
              <textarea
                id="post-excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                required
                className={fieldCls}
              />
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Cover image</p>
            <div className="mt-4">
              <ImageField name="cover" initial={initial.cover ?? ""} onValue={setCoverVal} />
            </div>
          </div>

          <div className={cardCls} data-testid="post-body">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={cardTitleCls}>Body · {paras.length} paragraphs</p>
              <button type="button" onClick={() => { setParas([...paras, ""]); setHeads([...heads, false]); }} className="rounded-lg border border-dashed border-olive/40 px-3.5 py-2 font-body text-xs font-semibold text-ivory/60 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
                + Add paragraph
              </button>
            </div>
            <p className="mt-2 font-body text-xs text-ivory/35">H2 marks a section heading - sections power the table of contents, the pull-quote slot and image placement. Image N sits under section N.</p>
            <div className="mt-4 space-y-3">
              {paras.map((p, i) => {
                const isHead = heads[i] === true;
                return (
                  <div key={i} className="rounded-xl border border-olive/25 bg-espresso/60 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-md bg-umber px-2 py-0.5 font-mono text-[11px] text-ivory/50">
                        {"P" + (i + 1) + " · S" + (sectionOf(i) + 1)}{isHead ? " · H2" : ""}
                      </span>
                      <span className="ml-auto flex gap-1.5">
                        <button type="button" title="Move up" disabled={i === 0} onClick={() => movePara(i, -1)} className={iconBtnCls}>↑</button>
                        <button type="button" title="Move down" disabled={i === paras.length - 1} onClick={() => movePara(i, 1)} className={iconBtnCls}>↓</button>
                        <button type="button" title="Toggle H2 heading" onClick={() => toggleHead(i)} className={iconBtnCls + (isHead ? " !border-sienna-bright/60 !text-sienna-bright" : "")}>H</button>
                        <button type="button" title="Remove" disabled={paras.length === 1} onClick={() => removePara(i)} className={iconBtnCls}>✕</button>
                      </span>
                    </div>
                    <textarea
                      value={p}
                      onChange={(e) => setPara(i, e.target.value)}
                      rows={isHead ? 1 : 4}
                      placeholder={isHead ? "Section heading" : "Write a paragraph…"}
                      className={fieldCls + (isHead ? " !font-display !text-base !font-semibold" : "")}
                    />
                  </div>
                );
              })}
            </div>
            <input type="hidden" name="body" value={bodyValue} />
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Inline images</p>
            <p className="mt-1.5 font-body text-xs text-ivory/35">Image N appears under section N, with its caption.</p>
            <div className="mt-4">
              <ImageRows name="images" initial={initial.images ?? ""} secondKey="caption" secondLabel="Caption" onValue={setImagesJson} />
            </div>
          </div>

          <div className={cardCls}>
            <label htmlFor="post-quote" className={miniLabelCls}>Pull quote (shows after the second section)</label>
            <textarea id="post-quote" name="quote" value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} className={fieldCls} />
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="post-takeaways" className={miniLabelCls}>Takeaways · one per line (the “In this article” box)</label>
                <textarea id="post-takeaways" name="takeaways" value={takeawaysText} onChange={(e) => setTakeawaysText(e.target.value)} rows={5} className={fieldCls} />
              </div>
              <div>
                <label htmlFor="post-keywords" className={miniLabelCls}>Keywords · one per line (first line becomes the focus keyword)</label>
                <textarea id="post-keywords" name="keywords" value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} rows={4} className={fieldCls} />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>FAQs</p>
            <p className="mt-1.5 font-body text-xs text-ivory/35">Answered on the page and emitted as FAQ schema for Google results.</p>
            <div className="mt-4">
              <FaqEditor name="faqs" initial={initial.faqs ?? ""} onValue={setFaqsJson} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardCls}>
            <p className={cardTitleCls}>Status</p>
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input name="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-5 w-5 accent-[#ff5001]" />
              <span className="font-body text-sm text-ivory/80">Published (visible on site)</span>
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="post-date" className={miniLabelCls}>Date</label>
                <input id="post-date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={fieldCls} />
              </div>
              <div>
                <label htmlFor="post-updated" className={miniLabelCls}>Updated</label>
                <input id="post-updated" name="updated" type="date" value={updated} onChange={(e) => setUpdated(e.target.value)} className={fieldCls} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="post-readtime" className={miniLabelCls}>Read time</label>
              <div className="flex gap-2">
                <input id="post-readtime" name="readTime" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder={autoRead} className={fieldCls + " min-w-0 flex-1"} />
                <button type="button" onClick={() => setReadTime(autoRead)} className="shrink-0 rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/70 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright">
                  Auto
                </button>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="post-author" className={miniLabelCls}>Author</label>
              <input id="post-author" name="author" value={author} onChange={(e) => onAuthor(e.target.value)} list="post-authors" className={fieldCls} />
              <datalist id="post-authors">
                {authors.map((a) => (
                  <option key={a.name} value={a.name}>{a.role}</option>
                ))}
              </datalist>
            </div>
            <div className="mt-4">
              <label htmlFor="post-role" className={miniLabelCls}>Author role</label>
              <input id="post-role" name="authorRole" value={authorRole} onChange={(e) => { setAuthorRole(e.target.value); setRoleTouched(true); }} className={fieldCls} />
            </div>
            <div className="mt-4">
              <label htmlFor="post-cat" className={miniLabelCls}>Category</label>
              <input id="post-cat" name="category" value={category} onChange={(e) => setCategory(e.target.value)} list="post-cats" className={fieldCls} />
              <datalist id="post-cats">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Focus keyword</p>
            <input value={focusKw} onChange={(e) => setFocusKw(e.target.value)} placeholder="e.g. brand positioning" className={fieldCls + " mt-4"} />
            <p className="mt-2 font-body text-xs text-ivory/35">Drives the checklist below. Not saved - the first keyword line is the stored one.</p>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Search preview</p>
            <div className="mt-4 rounded-xl border border-olive/25 bg-espresso/60 p-4">
              <p className="truncate font-body text-[13px] text-ivory/45">{siteUrl.replace(/\/$/, "")}/blog/{slug !== "" ? slug : "…"}</p>
              <p className="mt-1 font-body text-base leading-snug text-[#8ab4f8]">{title !== "" ? title : "Untitled post"}</p>
              <p className="mt-1 line-clamp-2 font-body text-[13px] leading-relaxed text-ivory/55">{excerpt !== "" ? excerpt : "Write an excerpt - it shows here and in every share card."}</p>
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Checklist</p>
            <div className="mt-4 space-y-6">
              <CheckGroup title="SEO" items={checks.seo} />
              <CheckGroup title="AEO · answers" items={checks.aeo} />
              <CheckGroup title="Trust" items={checks.trust} />
            </div>
          </div>

          <div className={"rounded-2xl border p-5 " + (bads > 0 ? "border-red-400/40 bg-red-500/10" : warns > 0 ? "border-amber-400/40 bg-amber-500/10" : "border-emerald-400/40 bg-emerald-500/10")}>
            <p className="font-display text-base font-semibold text-ivory">
              {bads > 0 ? bads + " fixes needed before publish" : warns > 0 ? "Ready - " + warns + " suggestions" : "Ready to publish"}
            </p>
            <p className="mt-1 font-body text-xs text-ivory/55">
              Saving always works - this panel only advises. Green across the board means Google, snippets and AI answers all get what they want.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-olive/25 bg-espresso/90 p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
          {pending ? "Saving..." : isNew ? "Publish post" : "Save changes"}
        </button>
        {viewHref && !isNew && (
          <a href={viewHref} target="_blank" rel="noreferrer" className="btn btn-secondary">
            View on site
          </a>
        )}
      </div>
    </form>
  );
}
