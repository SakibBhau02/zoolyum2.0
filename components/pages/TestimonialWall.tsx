"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
type TestimonialItem = { quote: string; author: string; company: string; industry: string };

/**
 * TestimonialWall — magazine-style quotes, filterable by industry.
 */
export function TestimonialWall({ testimonials }: { testimonials: TestimonialItem[] }) {
  const [filter, setFilter] = useState("All");

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(testimonials.map((t) => t.industry)))],
    [testimonials]
  );

  const visible = testimonials.filter(
    (t) => filter === "All" || t.industry === filter
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filter testimonials by industry">
        {industries.map((industry) => (
          <button
            key={industry}
            type="button"
            aria-pressed={filter === industry}
            onClick={() => setFilter(industry)}
            className={`rounded-full border px-5 py-2.5 font-display text-[13px] font-semibold tracking-wide transition-all duration-300 ${
              filter === industry
                ? "border-sienna-bright bg-sienna-bright text-espresso"
                : "border-olive/35 text-ivory/70 hover:border-sienna-bright/50 hover:text-sienna-bright"
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((testimonial) => (
            <motion.figure
              key={testimonial.company}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="card-surface relative flex h-full flex-col p-9"
            >
              <span
                aria-hidden="true"
                className="absolute right-7 top-4 font-display text-7xl font-semibold leading-none text-sienna/15"
              >
                &ldquo;
              </span>
              <blockquote className="flex-1">
                <p className="font-accent text-xl italic leading-relaxed text-ivory/90">
                  {testimonial.quote}
                </p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-olive/20 pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-espresso font-display text-sm font-semibold text-sienna-bright ring-1 ring-sienna/40">
                  {testimonial.company.split(" ").map((w) => w[0]).join("")}
                </span>
                <span>
                  <span className="block font-display text-sm font-semibold text-ivory">
                    {testimonial.author}, {testimonial.company}
                  </span>
                  <span className="mt-0.5 block font-body text-xs tracking-wide text-ivory/45">
                    {testimonial.industry}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
