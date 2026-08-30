"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { PROJECTS } from "@/lib/data";
import { ConfidenceIndicator } from "@/components/ui/metrics";
import { Tilt } from "@/components/ui/Tilt";

/**
 * WorkGallery — device #5: case studies as "Positions Held."
 * Clean, filterable grid framed around ground each client now
 * holds, one Confidence Indicator per card.
 */
export function WorkGallery() {
  const [filter, setFilter] = useState("All");

  const filters = useMemo(() => {
    const industries = PROJECTS.map((p) => p.industry);
    const services = Array.from(new Set(PROJECTS.flatMap((p) => p.services)));
    return ["All", ...Array.from(new Set(industries)), ...services];
  }, []);

  const visible = useMemo(() => {
    if (filter === "All") return PROJECTS;
    return PROJECTS.filter(
      (p) => p.industry === filter || p.services.includes(filter)
    );
  }, [filter]);

  return (
    <div>
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filter work">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-5 py-2.5 font-display text-[13px] font-semibold tracking-wide transition-all duration-300 ${
              filter === f
                ? "border-sienna-bright bg-sienna-bright text-espresso"
                : "border-olive/35 text-ivory/70 hover:border-sienna-bright/50 hover:text-sienna-bright"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.article
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Tilt className="h-full">
              <Link
                href={`/work/${project.slug}`}
                className="card-surface group block h-full"
              >
                <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${project.gradient}`}>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-5 left-5 select-none font-display text-[7rem] font-semibold leading-none tracking-tight text-espresso/20 transition-transform duration-500 ease-read group-hover:scale-105"
                  >
                    {project.client.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <span className="absolute left-5 top-5 rounded-full bg-espresso/60 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-widest text-ivory backdrop-blur-sm">
                    {project.industry}
                  </span>
                </div>
                <div className="p-7">
                  <h2 className="font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {project.client}
                  </h2>
                  <p className="body-copy mt-2 font-body text-sm leading-relaxed text-ivory/55">
                    {project.title}
                  </p>
                  <div className="mt-6 border-t border-olive/20 pt-5">
                    <ConfidenceIndicator
                      value={project.stats[0].value}
                      label={project.stats[0].label}
                    />
                  </div>
                </div>
              </Link>
              </Tilt>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="mt-16 text-center font-accent text-xl italic text-ivory/45">
          No work in this filter yet. Ask us about yours.
        </p>
      )}
    </div>
  );
}
