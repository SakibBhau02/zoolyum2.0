"use client";

import { useRef, useState } from "react";
import type { NewsCopy } from "@/lib/content";
type TestimonialItem = { quote: string; author: string; company: string; industry: string };
import { Reveal, HorizonRule } from "@/components/ui/Reveal";
import { MarqueeRow } from "@/components/ui/MarqueeRow";
import { AccentSplit } from "@/components/ui/AccentSplit";
import { createLead } from "@/app/admin/actions";
import { fireBrowserLead, newLeadContext } from "@/lib/tracking-client";

/**
 * Chapter 6 — What Clients Say.
 * A Warm Ivory clearing with two always-moving testimonial rivers:
 * one flowing left → right, one right → left. Hover pauses a row;
 * reduced-motion falls back to a static grid. The inline newsletter
 * capture stays — "One strategic insight a month. No noise."
 */
export type VoicesCopy = {
  eyebrow: string; title: string; newsEyebrow: string; newsTitle: string; newsLead: string;
  news: NewsCopy;
};

export function Chapter6Voices({ testimonials, copy, news }: { testimonials: TestimonialItem[]; copy: VoicesCopy; news: NewsCopy }) {
  const rowA = testimonials.filter((_, i) => i % 2 === 0);
  const rowB = testimonials.filter((_, i) => i % 2 === 1);

  return (
    <section
      className="section-light relative overflow-hidden pb-12 pt-20 md:pb-16 md:pt-24"
      aria-label="What clients say"
    >
      <div className="section-shell relative z-10">
        <Reveal>
          <p className="eyebrow eyebrow-dark">{copy.eyebrow}</p>
          <h2 className="mt-4 font-display text-display-2 font-semibold text-espresso">
            <AccentSplit text={copy.title} accentClassName="font-accent italic" />
          </h2>
        </Reveal>
      </div>

      {/* The two rivers — always moving */}
      <Reveal delay={100} className="relative z-10 mt-9">
        <MarqueeRow direction="ltr" duration={52} className="py-3">
          {rowA.map((t) => (
            <TestimonialCard key={`a-${t.company}`} {...t} />
          ))}
        </MarqueeRow>
        <MarqueeRow direction="rtl" duration={61} className="mt-6 py-3">
          {rowB.map((t) => (
            <TestimonialCard key={`b-${t.company}`} {...t} />
          ))}
        </MarqueeRow>
      </Reveal>

      <div className="section-shell relative z-10">
        {/* Inline newsletter capture — sequenced lead point */}
        <Reveal delay={160}>
          <div
            data-lead-inline
            className="mt-12 rounded-2xl border border-espresso/10 bg-ivory-deep p-7 md:p-9"
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="eyebrow eyebrow-dark">{copy.newsEyebrow}</p>
                <p className="mt-4 text-balance font-display text-display-3 font-semibold text-espresso">
                  <AccentSplit text={copy.newsTitle} accentClassName="text-espresso/75" />
                </p>
                <p className="body-copy mt-4 font-body text-[15px] leading-relaxed text-espresso/75">
                  {copy.newsLead}
                </p>
              </div>
              <NewsletterInlineForm news={news} />
            </div>
          </div>
        </Reveal>

        <HorizonRule className="mt-12 opacity-40" />
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  author,
  company,
  industry,
}: {
  quote: string;
  author: string;
  company: string;
  industry: string;
}) {
  return (
    <figure className="card-surface-light flex h-full w-[320px] shrink-0 flex-col p-6 md:w-[430px] md:p-7">
      <blockquote className="flex-1">
        <p className="line-clamp-3 font-accent text-[1.0625rem] italic leading-relaxed text-espresso/85 md:text-lg">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3.5 border-t border-espresso/10 pt-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory font-display text-xs font-semibold text-sienna ring-1 ring-sienna/40">
          {company.split(" ").map((w) => w[0]).join("")}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-semibold text-espresso">
            {author}, {company}
          </span>
          <span className="mt-0.5 block font-body text-xs tracking-wide text-espresso/72">
            {industry}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function NewsletterInlineForm({ news }: { news: NewsCopy }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const trapRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="md:justify-self-end md:w-full"
      aria-busy={busy}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email.trim() || busy || done) return;
        if ((trapRef.current?.value ?? "").trim() !== "") {
          setDone(true);
          return;
        }
        setBusy(true);
        setError("");
        const ctx = newLeadContext();
        try {
          const r = await createLead("newsletter", { email: email.trim() }, ctx);
          if (r.ok) {
            fireBrowserLead("newsletter", ctx);
            setDone(true);
          } else {
            setError(r.error ?? "Something went wrong. Please try again.");
          }
        } catch {
          setError("Something went wrong. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {done ? (
        <p className="font-accent text-xl italic text-sienna">
          {news.success}
        </p>
      ) : (
        <>
          <label htmlFor="ch6-newsletter" className="sr-only">
            {news.label}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="ch6-newsletter"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={news.placeholder}
              className="w-full rounded-lg border border-espresso/20 bg-ivory px-4 py-3.5 font-body text-sm text-espresso placeholder:text-espresso/65 transition-colors focus:border-sienna focus:outline-none sm:min-w-[260px]"
            />
            <button type="submit" className="btn btn-primary shrink-0">
              {news.button}
            </button>
          </div>
          <p className="mt-3 font-body text-xs text-espresso/72">
            {news.disclaimer}
          </p>
          {error && (
            <p role="alert" className="mt-2 font-body text-xs text-sienna-bright">
              {error}
            </p>
          )}
        </>
      )}
      <input
        ref={trapRef}
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
    </form>
  );
}
