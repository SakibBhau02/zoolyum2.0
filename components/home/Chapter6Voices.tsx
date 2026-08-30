"use client";

import { useState } from "react";
import { TESTIMONIALS } from "@/lib/data";
import { Reveal, HorizonRule } from "@/components/ui/Reveal";
import { MarqueeRow } from "@/components/ui/MarqueeRow";

/**
 * Chapter 6 — What Clients Say.
 * A Warm Ivory clearing with two always-moving testimonial rivers:
 * one flowing left → right, one right → left. Hover pauses a row;
 * reduced-motion falls back to a static grid. The inline newsletter
 * capture stays — "One strategic insight a month. No noise."
 */
export function Chapter6Voices() {
  const rowA = TESTIMONIALS.filter((_, i) => i % 2 === 0);
  const rowB = TESTIMONIALS.filter((_, i) => i % 2 === 1);

  return (
    <section
      className="section-light relative overflow-hidden py-24 md:py-32"
      aria-label="What clients say"
    >
      <div className="section-shell relative z-10">
        <Reveal>
          <p className="eyebrow eyebrow-dark">What Clients Say</p>
          <h2 className="mt-4 font-display text-display-2 font-semibold text-espresso">
            In their <span className="font-accent italic">words.</span>
          </h2>
        </Reveal>
      </div>

      {/* The two rivers — always moving */}
      <Reveal delay={100} className="relative z-10 mt-12">
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
            className="mt-16 rounded-2xl border border-espresso/10 bg-ivory-deep p-9 md:p-12"
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="eyebrow eyebrow-dark">One insight a month</p>
                <p className="mt-4 font-display text-display-3 font-semibold text-espresso">
                  One strategic insight a month.{" "}
                  <span className="text-espresso/55">No noise.</span>
                </p>
                <p className="body-copy mt-4 font-body text-[15px] leading-relaxed text-espresso/60">
                  The same discipline we bring to client work, in an email.
                  Reading time: four minutes. Everything else: nothing.
                </p>
              </div>
              <NewsletterInlineForm />
            </div>
          </div>
        </Reveal>

        <HorizonRule className="mt-20 opacity-40" />
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
    <figure className="card-surface-light flex h-full w-[320px] shrink-0 flex-col p-7 md:w-[430px] md:p-8">
      <blockquote className="flex-1">
        <p className="line-clamp-4 font-accent text-[1.0625rem] italic leading-relaxed text-espresso/85 md:text-lg">
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
          <span className="mt-0.5 block font-body text-xs tracking-wide text-espresso/50">
            {industry}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function NewsletterInlineForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className="md:justify-self-end md:w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
    >
      {done ? (
        <p className="font-accent text-xl italic text-sienna">
          You&apos;re on the list. First insight arrives next month.
        </p>
      ) : (
        <>
          <label htmlFor="ch6-newsletter" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="ch6-newsletter"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full rounded-lg border border-espresso/20 bg-ivory px-4 py-3.5 font-body text-sm text-espresso placeholder:text-espresso/40 transition-colors focus:border-sienna focus:outline-none sm:min-w-[260px]"
            />
            <button type="submit" className="btn btn-primary shrink-0">
              Subscribe
            </button>
          </div>
          <p className="mt-3 font-body text-xs text-espresso/45">
            No spam, no sharing, unsubscribe anytime.
          </p>
        </>
      )}
    </form>
  );
}
