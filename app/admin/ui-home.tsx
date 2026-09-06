"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveSettings } from "./actions";
import { JsonRows } from "./ui";

type Kind = "text" | "textarea" | "url";
type F = { key: string; label: string; kind: Kind; max?: number; rows?: number; help?: string };

const fieldCls =
  "w-full rounded-lg border border-olive/35 bg-espresso px-4 py-2.5 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
const miniLabelCls =
  "mb-2 block font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50";
const cardCls = "card-surface p-6 md:p-7";
const secTitleCls = "font-display text-lg font-semibold text-ivory";
const secNoteCls = "mt-1.5 font-body text-xs leading-relaxed text-ivory/40";
const iconBtnCls =
  "rounded-lg border border-olive/35 px-2.5 py-1.5 font-body text-xs text-ivory/60 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright disabled:opacity-30";
const rowCls = "rounded-xl border border-olive/25 bg-espresso/60 p-4";
const subLabelCls =
  "mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/45";
const subInputCls =
  "w-full rounded-lg border border-olive/35 bg-espresso px-3.5 py-2 font-body text-sm text-ivory focus:border-sienna-bright/70 focus:outline-none";
const addBtnCls =
  "rounded-lg border border-dashed border-olive/40 px-3.5 py-2 font-body text-xs font-semibold text-ivory/60 transition-colors hover:border-sienna-bright/60 hover:text-sienna-bright";

function Counter({ n, max }: { n: number; max?: number }) {
  if (max === undefined) return <span className="font-body text-[11px] text-ivory/35">{n}</span>;
  const over = n > max;
  return (
    <span className={"font-body text-[11px] " + (over ? "font-semibold text-red-300" : "text-ivory/35")}>
      {n}/{max}{over ? " - over limit" : ""}
    </span>
  );
}

function TextField({ f, value, onChange }: { f: F; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={"h-" + f.key} className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50">
          {f.label}
        </label>
        <Counter n={value.length} max={f.max} />
      </div>
      {f.kind === "textarea" ? (
        <textarea
          id={"h-" + f.key}
          name={"s:" + f.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={f.rows ?? 3}
          className={fieldCls}
        />
      ) : (
        <input
          id={"h-" + f.key}
          name={"s:" + f.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={f.kind === "url" ? "/contact or https://…" : undefined}
          className={fieldCls + (f.kind === "url" ? " font-mono !text-[13px]" : "")}
        />
      )}
      {f.help && <p className="mt-1.5 font-body text-xs text-ivory/35">{f.help}</p>}
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className={cardCls}>
      <h2 className={secTitleCls}>{title}</h2>
      {note && <p className={secNoteCls}>{note}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function move<T>(list: T[], i: number, dir: number): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = list.slice();
  next[i] = list[j];
  next[j] = list[i];
  return next;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    const v = JSON.parse(raw || "") as T;
    return v === null || v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

function toLines(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

type StageRow = { num: string; title: string; detail: string; outputs: string };

function StageEditor({ initial }: { initial: string }) {
  const [rows, setRows] = useState<StageRow[]>(() => {
    const v = parseJson<unknown>(initial, []);
    if (!Array.isArray(v)) return [];
    return v.map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      const outs = Array.isArray(o.outputs) ? o.outputs.map((x) => String(x ?? "")).join("\n") : "";
      return {
        num: typeof o.num === "string" ? o.num : String(o.num ?? ""),
        title: typeof o.title === "string" ? o.title : "",
        detail: typeof o.detail === "string" ? o.detail : "",
        outputs: outs,
      };
    });
  });
  const set = (i: number, patch: Partial<StageRow>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const json = JSON.stringify(
    rows.map((r) => ({ num: r.num.trim(), title: r.title.trim(), detail: r.detail.trim(), outputs: toLines(r.outputs) })),
  );
  return (
    <div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className={rowCls}>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-umber px-2 py-0.5 font-mono text-[11px] text-ivory/50">Stage {i + 1}</span>
              <span className="ml-auto flex gap-1.5">
                <button type="button" disabled={i === 0} onClick={() => setRows(move(rows, i, -1))} className={iconBtnCls}>Up</button>
                <button type="button" disabled={i === rows.length - 1} onClick={() => setRows(move(rows, i, 1))} className={iconBtnCls}>Down</button>
                <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className={iconBtnCls}>Remove</button>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={subLabelCls}>Number</label>
                <input value={r.num} onChange={(e) => set(i, { num: e.target.value })} placeholder="01" className={subInputCls} />
              </div>
              <div>
                <label className={subLabelCls}>Stage name</label>
                <input value={r.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="Discover" className={subInputCls} />
              </div>
            </div>
            <div className="mt-3">
              <label className={subLabelCls}>Description</label>
              <textarea value={r.detail} onChange={(e) => set(i, { detail: e.target.value })} rows={2} className={subInputCls} />
            </div>
            <div className="mt-3">
              <label className={subLabelCls}>Deliverables - one per line</label>
              <textarea value={r.outputs} onChange={(e) => set(i, { outputs: e.target.value })} rows={3} className={subInputCls} />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, { num: String(rows.length + 1).padStart(2, "0"), title: "", detail: "", outputs: "" }])}
        className={addBtnCls + " mt-3"}
      >
        + Add stage
      </button>
      <input type="hidden" name="s:home.method.stages" value={json} />
    </div>
  );
}

type StatRow = { value: string; suffix: string; label: string };

function StatEditor({ initial }: { initial: string }) {
  const [rows, setRows] = useState<StatRow[]>(() => {
    const v = parseJson<unknown>(initial, []);
    if (!Array.isArray(v)) return [];
    return v.map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return {
        value: typeof o.value === "number" ? String(o.value) : typeof o.value === "string" ? o.value : "",
        suffix: typeof o.suffix === "string" ? o.suffix : "",
        label: typeof o.label === "string" ? o.label : "",
      };
    });
  });
  const set = (i: number, patch: Partial<StatRow>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const json = JSON.stringify(
    rows.map((r) => ({ value: Number(r.value) || 0, suffix: r.suffix, label: r.label.trim() })),
  );
  return (
    <div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className={rowCls}>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-umber px-2 py-0.5 font-mono text-[11px] text-ivory/50">Stat {i + 1}</span>
              <span className="ml-auto flex gap-1.5">
                <button type="button" disabled={i === 0} onClick={() => setRows(move(rows, i, -1))} className={iconBtnCls}>Up</button>
                <button type="button" disabled={i === rows.length - 1} onClick={() => setRows(move(rows, i, 1))} className={iconBtnCls}>Down</button>
                <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className={iconBtnCls}>Remove</button>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className={subLabelCls}>Number (counts up)</label>
                <input value={r.value} onChange={(e) => set(i, { value: e.target.value })} inputMode="numeric" placeholder="8" className={subInputCls} />
              </div>
              <div>
                <label className={subLabelCls}>Suffix</label>
                <input value={r.suffix} onChange={(e) => set(i, { suffix: e.target.value })} placeholder="+" className={subInputCls} />
              </div>
              <div>
                <label className={subLabelCls}>Label</label>
                <input value={r.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="Years in the market" className={subInputCls} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, { value: "", suffix: "", label: "" }])}
        className={addBtnCls + " mt-3"}
      >
        + Add stat
      </button>
      <input type="hidden" name="s:home.results.stats" value={json} />
    </div>
  );
}

function TickerEditor({ initial }: { initial: string }) {
  const [text, setText] = useState(() => {
    const v = parseJson<unknown>(initial, []);
    return Array.isArray(v) ? v.map((x) => String(x ?? "")).join("\n") : "";
  });
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className={fieldCls}
      />
      <p className="mt-1.5 font-body text-xs text-ivory/35">One item per line, in display order.</p>
      <input type="hidden" name="s:home.ticker" value={JSON.stringify(toLines(text))} />
    </div>
  );
}

const LOCKUP_FIELDS = [
  { key: "word", label: "Word" },
  { key: "stage", label: "Stage" },
];

const HERO: F[] = [
  { key: "home.hero.eyebrow", label: "Eyebrow", kind: "text", max: 40 },
  { key: "home.hero.titleA", label: "Headline part 1", kind: "text", help: "All three parts together: keep under ~90 characters." },
  { key: "home.hero.titleAccent", label: "Headline accent word", kind: "text" },
  { key: "home.hero.titleB", label: "Headline part 2", kind: "text" },
  { key: "home.hero.sub", label: "Subheadline", kind: "textarea", rows: 3, max: 220 },
  { key: "home.hero.ctaPrimary", label: "Primary button", kind: "text" },
  { key: "home.hero.ctaPrimaryHref", label: "Primary button link", kind: "url" },
  { key: "home.hero.ctaSecondary", label: "Secondary button", kind: "text" },
  { key: "home.hero.ctaSecondaryHref", label: "Secondary button link", kind: "url" },
  { key: "home.hero.hint", label: "Scroll hint", kind: "text" },
  { key: "home.hero.meter", label: "Meter label", kind: "text" },
  { key: "home.hero.beatB", label: "Beat 2 line (| = line break)", kind: "text" },
  { key: "home.hero.beatC", label: "Beat 3 line (| = line break)", kind: "text" },
  { key: "home.hero.beatD", label: "Beat 4 line (| = line break)", kind: "text" },
];

const TAGLINE_TOP: F[] = [
  { key: "home.tagline.eyebrow", label: "Chapter eyebrow", kind: "text" },
  { key: "home.tagline.openerA", label: "Opener line 1", kind: "text" },
  { key: "home.tagline.openerB", label: "Opener line 2", kind: "text" },
  { key: "home.tagline.openerSub", label: "Opener intro", kind: "textarea", rows: 2 },
];

function actFields(n: string): F[] {
  return [
    { key: "home.tagline.act" + n + ".step", label: "Act " + n + " step label", kind: "text" },
    { key: "home.tagline.act" + n + ".title", label: "Act " + n + " title (dot added automatically)", kind: "text" },
    { key: "home.tagline.act" + n + ".sub", label: "Act " + n + " subtitle", kind: "textarea", rows: 2 },
    { key: "home.tagline.act" + n + ".body", label: "Act " + n + " paragraph", kind: "textarea", rows: 4 },
  ];
}

const TAGLINE_END: F[] = [
  { key: "home.tagline.lockupEyebrow", label: "Lockup eyebrow", kind: "text" },
  { key: "home.tagline.lockupNote", label: "Closing note", kind: "textarea", rows: 2 },
  { key: "home.tagline.cta", label: "Closing link label", kind: "text" },
  { key: "home.tagline.ctaHref", label: "Closing link URL", kind: "url" },
];

const METHOD_TOP: F[] = [
  { key: "home.method.eyebrow", label: "Eyebrow", kind: "text" },
  { key: "home.method.title", label: "Heading (| = accent part)", kind: "text" },
  { key: "home.method.lead", label: "Intro", kind: "textarea", rows: 2 },
  { key: "home.method.hint", label: "Scroll hint", kind: "text" },
];

const RESULTS_TOP: F[] = [
  { key: "home.results.eyebrow", label: "Eyebrow", kind: "text" },
  { key: "home.results.title", label: "Heading (| = accent part)", kind: "text" },
  { key: "home.results.lead", label: "Intro", kind: "textarea", rows: 2 },
  { key: "home.results.closing", label: "Closing paragraph", kind: "textarea", rows: 3 },
];

const WORK: F[] = [
  { key: "home.work.eyebrow", label: "Eyebrow", kind: "text" },
  { key: "home.work.title", label: "Heading (| = accent part)", kind: "text" },
  { key: "home.work.lead", label: "Intro", kind: "textarea", rows: 2 },
  { key: "home.work.cta", label: "View-all link label", kind: "text" },
  { key: "home.work.href", label: "View-all link URL", kind: "url" },
  { key: "home.work.nextTitle", label: "Closing card heading", kind: "text" },
  { key: "home.work.nextText", label: "Closing card text", kind: "textarea", rows: 2 },
  { key: "home.work.nextCta", label: "Closing button label", kind: "text" },
  { key: "home.work.nextHref", label: "Closing button link", kind: "url" },
];

const VOICES: F[] = [
  { key: "home.voices.eyebrow", label: "Eyebrow", kind: "text" },
  { key: "home.voices.title", label: "Heading (| = accent part)", kind: "text" },
  { key: "home.voices.newsEyebrow", label: "Newsletter eyebrow", kind: "text" },
  { key: "home.voices.newsTitle", label: "Newsletter heading (| = accent part)", kind: "text" },
  { key: "home.voices.newsLead", label: "Newsletter intro", kind: "textarea", rows: 2 },
];

const NEWS: F[] = [
  { key: "home.news.placeholder", label: "Email placeholder", kind: "text" },
  { key: "home.news.button", label: "Button label", kind: "text" },
  { key: "home.news.disclaimer", label: "Disclaimer line", kind: "text" },
  { key: "home.news.success", label: "Success message", kind: "text" },
  { key: "home.news.label", label: "Screen-reader label", kind: "text" },
];

const CTA: F[] = [
  { key: "home.cta.eyebrow", label: "Eyebrow", kind: "text" },
  { key: "home.cta.title", label: "Heading (| = muted part)", kind: "textarea", rows: 2 },
  { key: "home.cta.lead", label: "Intro", kind: "textarea", rows: 2 },
  { key: "home.cta.primary", label: "Primary button", kind: "text" },
  { key: "home.cta.primaryHref", label: "Primary button link", kind: "url" },
  { key: "home.cta.secondary", label: "Secondary button", kind: "text" },
  { key: "home.cta.secondaryHref", label: "Secondary button link", kind: "url" },
];

const SKIP: F[] = [
  { key: "home.skip.text", label: "Prompt line", kind: "text" },
  { key: "home.skip.cta", label: "Link label", kind: "text" },
  { key: "home.skip.href", label: "Link URL", kind: "url" },
];

const FOOT: F[] = [
  { key: "home.footer.blurb", label: "Studio blurb", kind: "textarea", rows: 2 },
  { key: "home.footer.newsTitle", label: "Newsletter heading", kind: "text" },
  { key: "home.footer.newsText", label: "Newsletter intro", kind: "textarea", rows: 2 },
  { key: "home.footer.based", label: "Location suffix", kind: "text" },
];

const TRUST_FIELDS = [
  { key: "value", label: "Value" },
  { key: "label", label: "Label" },
];

const WORKPAGE_HERO: F[] = [
  { key: "work.page.eyebrow", label: "Eyebrow", kind: "text" },
  { key: "work.page.titleA", label: "Heading part 1", kind: "text" },
  { key: "work.page.titleB", label: "Heading part 2 (accent)", kind: "text" },
  { key: "work.page.lead", label: "Intro", kind: "textarea", rows: 2 },
];

const WORKPAGE_UI: F[] = [
  { key: "work.ui.filter", label: "Filter button", kind: "text" },
  { key: "work.ui.all", label: "All-work option", kind: "text" },
  { key: "work.ui.industry", label: "Industry group label", kind: "text" },
  { key: "work.ui.service", label: "Service group label", kind: "text" },
  { key: "work.ui.showingA", label: "Count word 1", kind: "text", help: "Renders as: [word 1] N [word 2] M [word 3]." },
  { key: "work.ui.showingB", label: "Count word 2", kind: "text" },
  { key: "work.ui.showingC", label: "Count word 3", kind: "text" },
  { key: "work.ui.featured", label: "Featured tag", kind: "text" },
  { key: "work.ui.read", label: "Read link", kind: "text" },
  { key: "work.ui.engagement", label: "Timeline suffix", kind: "text", help: "Renders after the timeline, e.g. 3 months + engagement." },
  { key: "work.ui.empty", label: "Empty-filter line", kind: "text" },
  { key: "work.ui.menuLabel", label: "Filter menu label (screen readers)", kind: "text" },
];

const WORKPAGE_CTA: F[] = [
  { key: "work.cta.titleA", label: "Heading part 1", kind: "text" },
  { key: "work.cta.titleB", label: "Heading part 2 (accent)", kind: "text" },
  { key: "work.cta.text", label: "Body", kind: "textarea", rows: 3 },
  { key: "work.cta.primary", label: "Primary button", kind: "text" },
  { key: "work.cta.primaryHref", label: "Primary button link", kind: "url" },
  { key: "work.cta.secondary", label: "Secondary button", kind: "text" },
  { key: "work.cta.secondaryHref", label: "Secondary button link", kind: "url" },
];

const CASE_SECTIONS: F[] = [
  { key: "work.case.eyebrowPrefix", label: "Hero eyebrow prefix", kind: "text", help: "Renders before the industry name." },
  { key: "work.case.snapshotEyebrow", label: "Snapshot eyebrow", kind: "text" },
  { key: "work.case.rowClient", label: "Snapshot row: client", kind: "text" },
  { key: "work.case.rowIndustry", label: "Snapshot row: industry", kind: "text" },
  { key: "work.case.rowTimeline", label: "Snapshot row: timeline", kind: "text" },
  { key: "work.case.rowDisciplines", label: "Snapshot row: disciplines", kind: "text" },
  { key: "work.case.problemEyebrow", label: "Problem eyebrow", kind: "text" },
  { key: "work.case.problemNote", label: "Problem note", kind: "text" },
  { key: "work.case.solutionEyebrow", label: "Solution eyebrow", kind: "text" },
  { key: "work.case.solutionTitleA", label: "Solution heading part 1", kind: "text" },
  { key: "work.case.solutionTitleB", label: "Solution heading part 2", kind: "text" },
  { key: "work.case.overcomeEyebrow", label: "Overcome eyebrow", kind: "text" },
  { key: "work.case.overcomeTitleA", label: "Overcome heading part 1", kind: "text" },
  { key: "work.case.overcomeTitleB", label: "Overcome heading part 2", kind: "text" },
  { key: "work.case.toolboxEyebrow", label: "Toolbox eyebrow", kind: "text" },
  { key: "work.case.toolboxTitleA", label: "Toolbox heading part 1", kind: "text" },
  { key: "work.case.toolboxTitleB", label: "Toolbox heading part 2", kind: "text" },
  { key: "work.case.toolboxUngrouped", label: "Toolbox fallback group", kind: "text", help: "Group name for tools written without a Group: prefix." },
  { key: "work.case.resultsEyebrow", label: "Results eyebrow", kind: "text" },
  { key: "work.case.resultsTitleA", label: "Results heading part 1", kind: "text" },
  { key: "work.case.resultsTitleB", label: "Results heading part 2", kind: "text" },
  { key: "work.case.faqEyebrow", label: "FAQ eyebrow", kind: "text" },
  { key: "work.case.faqTitleA", label: "FAQ heading part 1", kind: "text" },
  { key: "work.case.faqTitleB", label: "FAQ heading part 2", kind: "text" },
  { key: "work.case.nextTitleA", label: "Next-steps heading part 1", kind: "text" },
  { key: "work.case.nextTitleB", label: "Next-steps heading part 2", kind: "text" },
  { key: "work.case.nextTextA", label: "Next-steps sentence 1", kind: "textarea", rows: 2, help: "Renders after the client name." },
  { key: "work.case.nextTextB", label: "Next-steps sentence 2", kind: "textarea", rows: 2 },
  { key: "work.case.nextLabel", label: "Next-case tag", kind: "text" },
];

const CASE_RAIL: F[] = [
  { key: "work.case.rail.snapshot", label: "Rail: snapshot", kind: "text" },
  { key: "work.case.rail.problem", label: "Rail: problem", kind: "text" },
  { key: "work.case.rail.solution", label: "Rail: solution", kind: "text" },
  { key: "work.case.rail.overcome", label: "Rail: overcome", kind: "text" },
  { key: "work.case.rail.toolbox", label: "Rail: toolbox", kind: "text" },
  { key: "work.case.rail.frames", label: "Rail: frames", kind: "text" },
  { key: "work.case.rail.results", label: "Rail: results", kind: "text" },
  { key: "work.case.rail.faq", label: "Rail: faq", kind: "text" },
  { key: "work.case.rail.next", label: "Rail: next steps", kind: "text" },
];

export function HomeEditor({ initial }: { initial: Record<string, string> }) {
  const [vals, setVals] = useState<Record<string, string>>(() => ({ ...initial }));
  const [state, act, pending] = useActionState(saveSettings, { ok: false });
  const set = (k: string, v: string) => setVals((prev) => ({ ...prev, [k]: v }));
  const fields = (list: F[]) => (
    <>
      {list.map((f) => (
        <TextField key={f.key} f={f} value={vals[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
      ))}
    </>
  );
  return (
    <form action={act} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-body text-sm text-ivory/50">
          Every label below maps to one live spot on the homepage. Saving publishes immediately.
        </p>
        <button type="submit" disabled={pending} className="btn btn-primary ml-auto !px-5 !py-2 !text-sm disabled:opacity-50">
          {pending ? "Saving..." : "Save homepage"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 font-body text-sm text-emerald-300">
          Saved - live on the homepage now.
        </p>
      )}
      <Section title="1 · Hero" note="First screen. The headline renders in three parts with the middle word accented.">
        {fields(HERO)}
      </Section>
      <Section title="2 · Tagline chapter" note="Opener, three acts, lockup and closing link. Diagram words stay fixed by design.">
        {fields(TAGLINE_TOP)}
        {fields(actFields("1"))}
        {fields(actFields("2"))}
        {fields(actFields("3"))}
        <div>
          <p className={miniLabelCls}>Lockup words (in order)</p>
          <JsonRows name="s:home.tagline.lockup" initial={vals["home.tagline.lockup"] ?? ""} fields={LOCKUP_FIELDS} addLabel="Add word" emptyValue="[]" />
        </div>
        {fields(TAGLINE_END)}
      </Section>
      <Section title="3 · Method" note="Five stages. Outputs are one-per-line lists inside each stage.">
        {fields(METHOD_TOP)}
        <div>
          <p className={miniLabelCls}>Stages (in order)</p>
          <StageEditor initial={vals["home.method.stages"] ?? ""} />
        </div>
      </Section>
      <Section title="4 · Results" note="Stat numbers animate count-up, so the value must stay numeric.">
        {fields(RESULTS_TOP)}
        <div>
          <p className={miniLabelCls}>Stat cards (in order)</p>
          <StatEditor initial={vals["home.results.stats"] ?? ""} />
        </div>
      </Section>
      <Section title="5 · Selected work" note="Cards come from published case studies. Manage them under Content - Work. Only the frame copy lives here.">
        {fields(WORK)}
        <p className="font-body text-xs text-ivory/40">
          Cards: <Link href="/admin/projects" className="text-sienna-bright hover:underline">Work / Case Studies</Link>
          {" · "}Testimonials live under <Link href="/admin/testimonials" className="text-sienna-bright hover:underline">Testimonials</Link>.
        </p>
      </Section>
      <Section title="6 · Voices + newsletter" note="Testimonial rivers pull from Testimonials. The form below is shared with the footer.">
        {fields(VOICES)}
        {fields(NEWS)}
      </Section>
      <Section title="7 · Final CTA" note="Closing section before the footer.">
        {fields(CTA)}
      </Section>
      <Section title="8 · Industry ticker" note="One item per line, in display order. Uppercase is applied automatically.">
        <TickerEditor initial={vals["home.ticker"] ?? ""} />
      </Section>
      <Section title="9 · Skip prompt" note="Small branch link at the end of Chapter 1.">
        {fields(SKIP)}
      </Section>
      <Section title="10 · Footer extras" note="Links, contact and socials live in their own admin areas (Navigation Links, Site settings). Only footer-only copy lives here.">
        {fields(FOOT)}
        <p className="font-body text-xs text-ivory/40">
          Navigation: <Link href="/admin/menulinks" className="text-sienna-bright hover:underline">Navigation Links</Link>
          {" · "}Contact, socials, SEO: <Link href="/admin/settings" className="text-sienna-bright hover:underline">Site settings</Link>.
        </p>
      </Section>
      <Section title="11 · Work page" note="Gallery hero, trust bar, filter labels and the closing band. Case cards come from published case studies.">
        {fields(WORKPAGE_HERO)}
        <div>
          <p className={miniLabelCls}>Trust bar (in order)</p>
          <JsonRows name="s:work.page.trust" initial={vals["work.page.trust"] ?? ""} fields={TRUST_FIELDS} addLabel="Add proof" emptyValue="[]" />
        </div>
        {fields(WORKPAGE_UI)}
        {fields(WORKPAGE_CTA)}
      </Section>
      <Section title="12 · Case page labels" note="Every fixed heading on the case-study page. The rail labels rename the side dots; section ids never change.">
        {fields(CASE_SECTIONS)}
        <div>
          <p className={miniLabelCls}>Side-rail labels</p>
          {fields(CASE_RAIL)}
        </div>
      </Section>
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-olive/25 bg-espresso/90 p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
          {pending ? "Saving..." : "Save homepage"}
        </button>
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-secondary">
          View homepage
        </a>
      </div>
    </form>
  );
}
