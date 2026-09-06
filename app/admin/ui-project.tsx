"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveItem } from "./actions";
import { JsonRows, MetaBox, STAT_FIELDS, MediaPicker } from "./ui";
import { parseYoutubeId, youtubeThumb } from "@/lib/text";
import type { CollectionKey } from "./config";

export const GRADIENTS = [
  "from-[#3A2E26] via-[#FF5001] to-[#FF7A3D]",
  "from-[#241F1B] via-[#3A2E26] to-[#7A7A5C]",
  "from-[#FF7A3D] via-[#FF5001] to-[#3A2E26]",
  "from-[#FF5001] via-[#3A2E26] to-[#241F1B]",
  "from-[#7A7A5C] via-[#3A2E26] to-[#FF5001]",
  "from-[#241F1B] via-[#3A2E26] to-[#FF5001]",
  "from-[#3A2E26] via-[#7A7A5C] to-[#FF5001]",
];

type Level = "ok" | "warn" | "bad";
type Check = { label: string; detail: string; level: Level };

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function Dot({ level }: { level: Level }) {
  const c = level === "ok" ? "bg-emerald-400" : level === "warn" ? "bg-amber-400" : "bg-red-400";
  return <span aria-hidden="true" className={"h-2 w-2 shrink-0 rounded-full " + c} />;
}

const fieldCls =
  "w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
const miniLabelCls =
  "mb-2 block font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50";
const cardCls = "card-surface p-6 md:p-7";
const cardTitleCls = "font-display text-base font-semibold text-ivory";
const secNote = "mt-2 font-body text-xs leading-relaxed text-ivory/40";
const iconBtnCls =
  "rounded-lg border border-olive/35 px-2.5 py-1.5 font-body text-xs text-ivory/60 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright disabled:opacity-30";
const rowCls = "rounded-xl border border-olive/25 bg-espresso/60 p-4";
const subInputCls =
  "w-full rounded-lg border border-olive/35 bg-espresso px-3.5 py-2 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
const addBtnCls =
  "rounded-lg border border-dashed border-olive/40 px-3.5 py-2 font-body text-xs font-semibold text-ivory/60 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright";
const subLabelCls = "mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/45";
const rmBtnCls = "rounded-lg border border-red-400/30 px-3 py-1.5 font-body text-xs text-red-300/80 transition-colors hover:bg-red-500/10 hover:text-red-300";
const ghostBtnCls = "shrink-0 rounded-lg border border-olive/35 px-3.5 py-2 font-body text-xs font-semibold text-ivory/70 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright";

function LinesRows({ name, initial, addLabel }: { name: string; initial: string; addLabel: string }) {
  const [rows, setRows] = useState<string[]>(() => (initial !== "" ? initial.split("\n") : []));
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = rows.slice();
    next[i] = rows[j];
    next[j] = rows[i];
    setRows(next);
  };
  return (
    <div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className={rowCls}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-umber px-2 py-0.5 font-mono text-[11px] text-ivory/50">Move {i + 1}</span>
              <span className="ml-auto flex gap-1.5">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={iconBtnCls}>Up</button>
                <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className={iconBtnCls}>Down</button>
                <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className={iconBtnCls}>Remove</button>
              </span>
            </div>
            <textarea
              value={r}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? e.target.value : x)))}
              rows={2}
              className={subInputCls}
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows([...rows, ""])} className={addBtnCls + " mt-3"}>
        {addLabel}
      </button>
      <input type="hidden" name={name} value={rows.map((r) => r.trim()).filter(Boolean).join("\n")} />
    </div>
  );
}

type ImgRow = { src: string; alt: string; kind: string; youtubeId: string };

function parseImgArr(raw: string): ImgRow[] {
  try {
    const v: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(v)) return [];
    return v.map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return {
        src: typeof o.src === "string" ? o.src : "",
        alt: typeof o.alt === "string" ? o.alt : "",
        kind: typeof o.kind === "string" ? o.kind : "image",
        youtubeId: typeof o.youtubeId === "string" ? o.youtubeId : "",
      };
    });
  } catch {
    return [];
  }
}

function parseRows(raw: string): { value: string; label: string }[] {
  try {
    const v: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(v)) return [];
    return v.map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return {
        value: typeof o.value === "string" ? o.value : String(o.value ?? ""),
        label: typeof o.label === "string" ? o.label : "",
      };
    });
  } catch {
    return [];
  }
}

type MediaRow = { src: string; alt: string; kind: "image" | "youtube" };

function parseMediaRows(raw: string): MediaRow[] {
  try {
    const v: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(v)) return [];
    return v.map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return {
        src: typeof o.src === "string" ? o.src : "",
        alt: typeof o.alt === "string" ? o.alt : "",
        kind: o.kind === "youtube" ? "youtube" : "image",
      };
    });
  } catch {
    return [];
  }
}

function MediaRows({ name, initial, onValue }: { name: string; initial: string; onValue?: (json: string) => void }) {
  const [items, setItems] = useState<MediaRow[]>(() => parseMediaRows(initial));
  const [pick, setPick] = useState<number | null>(null);
  const set = (i: number, patch: Partial<MediaRow>) => setItems(items.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const cleaned = items
    .map((r) => {
      const src = r.src.trim();
      const alt = r.alt.trim();
      if (r.kind === "youtube") {
        const youtubeId = parseYoutubeId(src);
        return youtubeId !== "" ? { src, alt, kind: "youtube" as const, youtubeId } : null;
      }
      return src !== "" ? { src, alt, kind: "image" as const } : null;
    })
    .filter((r) => r !== null);
  const json = JSON.stringify(cleaned);
  useEffect(() => {
    onValue?.(json);
  }, [json, onValue]);
  return (
    <div>
      <div className="space-y-3">
        {items.map((row, i) => {
          const vid = row.kind === "youtube" ? parseYoutubeId(row.src) : "";
          return (
          <div key={i} className={rowCls}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-olive/35" role="group" aria-label="Frame type">
                {(["image", "youtube"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={row.kind === k}
                    onClick={() => set(i, { kind: k })}
                    className={"px-3 py-1.5 font-body text-xs font-semibold transition-colors " + (row.kind === k ? "bg-sienna-bright text-espresso" : "text-ivory/55 hover:text-ivory")}
                  >
                    {k === "image" ? "Image" : "YouTube"}
                  </button>
                ))}
              </div>
              <span className="ml-auto">
                <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className={rmBtnCls}>
                  Remove
                </button>
              </span>
            </div>
            {row.kind === "image" ? (
              <div className="space-y-3">
                <div>
                  <label className={subLabelCls}>Image</label>
                  <div className="flex gap-2">
                    <input value={row.src} onChange={(e) => set(i, { src: e.target.value })} placeholder="/uploads/... or Browse" className={subInputCls + " min-w-0 flex-1"} />
                    <button type="button" onClick={() => setPick(i)} className={ghostBtnCls}>Browse</button>
                  </div>
                </div>
                {row.src.trim() !== "" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.src.trim()} alt="" loading="lazy" className="h-24 w-auto max-w-full rounded-lg border border-olive/25 object-cover" />
                )}
                <div>
                  <label className={subLabelCls}>Alt text</label>
                  <input value={row.alt} onChange={(e) => set(i, { alt: e.target.value })} placeholder="Describe the frame" className={subInputCls} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={subLabelCls}>YouTube link or id</label>
                  <input value={row.src} onChange={(e) => set(i, { src: e.target.value })} placeholder="Paste a watch, share or embed link" className={subInputCls} />
                </div>
                {vid !== "" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={youtubeThumb(vid)} alt="" loading="lazy" className="h-24 w-auto max-w-full rounded-lg border border-olive/25 object-cover" />
                ) : (
                  row.src.trim() !== "" && (
                    <p role="alert" className="font-body text-xs text-amber-300">That link does not look like a YouTube video - it will be skipped on save.</p>
                  )
                )}
                <div>
                  <label className={subLabelCls}>Alt text</label>
                  <input value={row.alt} onChange={(e) => set(i, { alt: e.target.value })} placeholder="Describe the video" className={subInputCls} />
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setItems([...items, { src: "", alt: "", kind: "image" }])} className={addBtnCls}>
          + Add image
        </button>
        <button type="button" onClick={() => setItems([...items, { src: "", alt: "", kind: "youtube" }])} className={addBtnCls}>
          + Add YouTube video
        </button>
      </div>
      <MediaPicker
        open={pick !== null}
        onClose={() => setPick(null)}
        onPick={(url) => {
          if (pick !== null) setItems(items.map((r, j) => (j === pick ? { ...r, src: url, kind: "image" } : r)));
        }}
      />
      <input type="hidden" name={name} value={json} />
    </div>
  );
}

export function ProjectEditor({
  collection,
  id,
  initial,
  isNew,
  industries,
  servicesList,
  viewHref,
}: {
  collection: CollectionKey;
  id: string;
  initial: Record<string, string>;
  isNew: boolean;
  industries: string[];
  servicesList: string[];
  viewHref?: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugTouched, setSlugTouched] = useState((initial.slug ?? "") !== "");
  const [client, setClient] = useState(initial.client ?? "");
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const [title, setTitle] = useState(initial.title ?? "");
  const [result, setResult] = useState(initial.result ?? "");
  const [timeline, setTimeline] = useState(initial.timeline ?? "");
  const [published, setPublished] = useState(initial.published === "true");
  const [sort, setSort] = useState(initial.sort ?? "");
  const [servicesText, setServicesText] = useState(initial.services ?? "");
  const [challenge, setChallenge] = useState(initial.challenge ?? "");
  const [strategy, setStrategy] = useState(initial.strategy ?? "");
  const [quote, setQuote] = useState(initial.quote ?? "");
  const [quoteAuthor, setQuoteAuthor] = useState(initial.quoteAuthor ?? "");
  const [gradient, setGradient] = useState(initial.gradient ?? "");
  const [imagesJson, setImagesJson] = useState(initial.images && initial.images !== "" ? initial.images : "[]");
  const [statsJson, setStatsJson] = useState(initial.stats && initial.stats !== "" ? initial.stats : "[]");
  const [metaJson, setMetaJson] = useState(initial.meta && initial.meta !== "" ? initial.meta : "null");

  const [state, act, pending] = useActionState(saveItem.bind(null, collection, id), { ok: false });
  useEffect(() => {
    if (state.ok) {
      router.push("/admin/" + collection);
      router.refresh();
    }
  }, [state.ok, router, collection]);

  const onClient = (v: string) => {
    setClient(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const checks = useMemo(() => {
    const stats = parseRows(statsJson);
    const images = parseImgArr(imagesJson);
    const playable = images.filter((g) => (g.kind === "youtube" ? g.youtubeId !== "" : g.src !== ""));
    const videos = playable.filter((g) => g.kind === "youtube").length;
    const captioned = images.filter((g) => g.alt !== "").length;
    type MetaShape = { overview?: unknown; obstacles?: unknown; toolbox?: unknown; deliverables?: unknown; faqs?: unknown };
    let meta: MetaShape | null = null;
    try {
      const v: unknown = JSON.parse(metaJson || "null");
      meta = v && typeof v === "object" && !Array.isArray(v) ? (v as MetaShape) : null;
    } catch { meta = null; }
    const obstacles = Array.isArray(meta?.obstacles) ? meta.obstacles.length : 0;
    const faqs = Array.isArray(meta?.faqs) ? meta.faqs.length : 0;
    const toolbox = Array.isArray(meta?.toolbox) ? meta.toolbox.length : 0;
    const deliverables = Array.isArray(meta?.deliverables) ? meta.deliverables.length : 0;
    const overview = typeof meta?.overview === "string" ? meta.overview.trim() : "";
    const svcCount = servicesText.split("\n").map((s) => s.trim()).filter(Boolean).length;
    const words = [challenge, strategy].join(" ").split(/\s+/).filter(Boolean).length;
    const req = (v: string, label: string): Check =>
      v.trim() !== "" ? { label, detail: "Set", level: "ok" } : { label, detail: "Missing - required", level: "bad" };
    const out: Check[] = [
      req(slug, "Slug"),
      req(client, "Client"),
      req(industry, "Industry"),
      req(title, "Card headline"),
      req(result, "Headline result"),
      req(timeline, "Timeline"),
      req(challenge, "Challenge"),
      req(strategy, "Strategy"),
      {
        label: "Stats (cards need the first one)",
        detail: stats.length === 0 ? "Missing - cards break without stats" : stats[0].value !== "" && stats[0].label !== "" ? stats.length + " stats" : "First stat is incomplete",
        level: stats.length === 0 || stats[0].value === "" || stats[0].label === "" ? "bad" : "ok",
      },
      { label: "Services", detail: svcCount + " listed", level: svcCount > 0 ? "ok" : "warn" },
      {
        label: "Gallery frames",
        detail:
          playable.length === 0
            ? "Missing - the frames section stays empty"
            : playable.length + " playable (" + videos + " video), " + captioned + " with alt text",
        level: playable.length === 0 ? "warn" : captioned === playable.length ? "ok" : "warn",
      },
      { label: "Card gradient", detail: gradient !== "" ? "Set" : "Missing - card art falls back to plain", level: gradient !== "" ? "ok" : "warn" },
      { label: "Dossier overview", detail: overview !== "" ? "Set" : "Missing", level: overview !== "" ? "ok" : "warn" },
      { label: "Obstacles", detail: obstacles + " listed", level: obstacles > 0 ? "ok" : "warn" },
      { label: "Case FAQs", detail: faqs + " answered", level: faqs > 0 ? "ok" : "warn" },
      { label: "Toolbox + deliverables", detail: toolbox + " tools, " + deliverables + " deliverables", level: toolbox > 0 && deliverables > 0 ? "ok" : "warn" },
      { label: "Client quote", detail: quote.trim() !== "" ? "Set" : "Missing", level: quote.trim() !== "" ? "ok" : "warn" },
      { label: "Body copy", detail: words + " words", level: words > 0 ? "ok" : "warn" },
    ];
    return out;
  }, [slug, client, industry, title, result, timeline, challenge, strategy, statsJson, imagesJson, metaJson, servicesText, gradient, quote]);

  const bads = checks.filter((c) => c.level === "bad").length;
  const warns = checks.filter((c) => c.level === "warn").length;

  return (
    <form action={act} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className={"rounded-full px-3 py-1 font-body text-xs font-semibold " + (published ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300")}>
          {published ? "Published" : "Draft"}
        </span>
        <span className="ml-auto flex items-center gap-2">
          {viewHref && !isNew && (
            <a href={viewHref} target="_blank" rel="noreferrer" className="btn btn-secondary !px-4 !py-2 !text-xs">
              View on site
            </a>
          )}
          <button type="submit" disabled={pending} className="btn btn-primary !px-5 !py-2 !text-sm disabled:opacity-50">
            {pending ? "Saving..." : isNew ? "Create case" : "Save changes"}
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
            <p className={cardTitleCls}>Identity</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pj-client" className={miniLabelCls}>Client *</label>
                <input id="pj-client" name="client" value={client} onChange={(e) => onClient(e.target.value)} required className={fieldCls} />
              </div>
              <div>
                <label htmlFor="pj-slug" className={miniLabelCls}>Slug {slugTouched ? "(manual)" : "(auto)"}</label>
                <input id="pj-slug" name="slug" value={slug} required onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} className={fieldCls + " font-mono !text-[13px]"} />
              </div>
              <div>
                <label htmlFor="pj-industry" className={miniLabelCls}>Industry *</label>
                <input id="pj-industry" name="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} list="pj-industries" required className={fieldCls} />
                <datalist id="pj-industries">
                  {industries.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="pj-timeline" className={miniLabelCls}>Timeline *</label>
                <input id="pj-timeline" name="timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="3 months" required className={fieldCls} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="pj-title" className={miniLabelCls}>Card headline *</label>
              <input id="pj-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={fieldCls} />
            </div>
            <div className="mt-4">
              <label htmlFor="pj-result" className={miniLabelCls}>Headline result *</label>
              <input id="pj-result" name="result" value={result} onChange={(e) => setResult(e.target.value)} placeholder="+42% enrollment in 3 months" required className={fieldCls} />
            </div>
            <div className="mt-4">
              <label htmlFor="pj-services" className={miniLabelCls}>Services (one per line)</label>
              <textarea id="pj-services" name="services" value={servicesText} onChange={(e) => setServicesText(e.target.value)} rows={3} placeholder={"Brand Strategy\nDigital Design"} className={fieldCls} />
              <p className="mt-1.5 font-body text-xs text-ivory/35">Known services: {servicesList.slice(0, 8).join(" · ")}{servicesList.length > 8 ? " · …" : ""}</p>
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Card art + order</p>
            <p className={secNote}>Pick a gradient for the card banner. Sort 1 leads the gallery as the featured case.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradient(g)}
                  aria-pressed={gradient === g}
                  title={g}
                  className={"h-16 overflow-hidden rounded-xl bg-gradient-to-br transition-all " + g + (gradient === g ? " ring-2 ring-sienna-bright ring-offset-2 ring-offset-espresso" : " border border-olive/25 hover:border-sienna-bright/60")}
                />
              ))}
              <button
                type="button"
                onClick={() => setGradient("")}
                className={"flex h-16 items-center justify-center rounded-xl border border-dashed border-olive/40 font-body text-xs text-ivory/50 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright" + (gradient === "" ? " !border-sienna-bright/60 !text-sienna-bright" : "")}
              >
                None
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pj-gradient" className={miniLabelCls}>Gradient classes</label>
                <input id="pj-gradient" name="gradient" value={gradient} onChange={(e) => setGradient(e.target.value)} className={fieldCls + " font-mono !text-[13px]"} />
              </div>
              <div>
                <label htmlFor="pj-sort" className={miniLabelCls}>Sort order</label>
                <input id="pj-sort" name="sort" type="number" value={sort} onChange={(e) => setSort(e.target.value)} placeholder="0" className={fieldCls} />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Story</p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="pj-challenge" className={miniLabelCls}>Challenge *</label>
                <textarea id="pj-challenge" name="challenge" value={challenge} onChange={(e) => setChallenge(e.target.value)} rows={3} required className={fieldCls} />
              </div>
              <div>
                <label htmlFor="pj-strategy" className={miniLabelCls}>Strategy *</label>
                <textarea id="pj-strategy" name="strategy" value={strategy} onChange={(e) => setStrategy(e.target.value)} rows={3} required className={fieldCls} />
              </div>
              <div>
                <p className={miniLabelCls}>Execution moves (in order)</p>
                <LinesRows name="execution" initial={initial.execution ?? ""} addLabel="+ Add move" />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Stats</p>
            <p className={secNote}>The first stat powers every card badge. Value plus label, both required.</p>
            <div className="mt-4">
              <JsonRows name="stats" initial={initial.stats ?? ""} fields={STAT_FIELDS} addLabel="+ Add stat" emptyValue="[]" onValue={setStatsJson} />
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Gallery images</p>
            <p className={secNote}>Mix uploads and YouTube links freely. The first image feeds search previews; add alt text everywhere.</p>
            <div className="mt-4">
              <MediaRows name="images" initial={initial.images ?? ""} onValue={setImagesJson} />
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Voice</p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="pj-quote" className={miniLabelCls}>Client quote</label>
                <textarea id="pj-quote" name="quote" value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} className={fieldCls} />
              </div>
              <div>
                <label htmlFor="pj-quoteauthor" className={miniLabelCls}>Quote author</label>
                <input id="pj-quoteauthor" name="quoteAuthor" value={quoteAuthor} onChange={(e) => setQuoteAuthor(e.target.value)} className={fieldCls} />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Case dossier</p>
            <p className={secNote}>Deep page sections: overview, obstacles, toolbox (Group: item lines group automatically), deliverables and FAQs.</p>
            <div className="mt-4">
              <MetaBox name="meta" initial={initial.meta ?? ""} onValue={setMetaJson} />
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
            <p className={secNote}>Unpublished cases stay hidden from the gallery, filters and search.</p>
          </div>

          <div className={cardCls}>
            <p className={cardTitleCls}>Checklist</p>
            <ul className="mt-4 space-y-2.5">
              {checks.map((c) => (
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

          <div className={"rounded-2xl border p-5 " + (bads > 0 ? "border-red-400/40 bg-red-500/10" : warns > 0 ? "border-amber-400/40 bg-amber-500/10" : "border-emerald-400/40 bg-emerald-500/10")}>
            <p className="font-display text-base font-semibold text-ivory">
              {bads > 0 ? bads + " fixes needed before publish" : warns > 0 ? "Ready - " + warns + " suggestions" : "Ready to publish"}
            </p>
            <p className="mt-1 font-body text-xs text-ivory/55">
              Saving always works - this panel only advises. Cards need the first stat; everything else degrades gracefully.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-olive/25 bg-espresso/90 p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
          {pending ? "Saving..." : isNew ? "Create case" : "Save changes"}
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