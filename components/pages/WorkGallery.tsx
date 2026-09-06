"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { ContentProject } from "@/lib/content";
import { Tilt } from "@/components/ui/Tilt";

/**
 * WorkGallery - the case-study library.
 * The lead case gets a full-width editorial feature; the rest sit in
 * a refined grid. One filter button opens a grouped menu (industries
 * and services). Every card reveals its challenge and disciplines on
 * hover - built to move a browsing prospect toward "read the full
 * case". On touch devices the detail drawer rests open.
 */

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m3.5 6 4.5 4.5L12.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type GalleryUi = {
  filter: string; all: string; industry: string; service: string;
  showingA: string; showingB: string; showingC: string;
  featured: string; read: string; engagement: string;
  empty: string; menuLabel: string;
};

export function WorkGallery({ projects, ui }: { projects: ContentProject[]; ui: GalleryUi }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const industries = useMemo(
    () => Array.from(new Set(projects.map((p) => p.industry))),
    [projects],
  );
  const services = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.services))),
    [projects],
  );
  const countFor = (name: string) =>
    projects.filter((p) => p.industry === name || p.services.includes(name))
      .length;

  /* Close the menu on Escape or an outside pointer press. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const visible = useMemo(() => {
    if (filter === "All") return projects;
    return projects.filter(
      (p) => p.industry === filter || p.services.includes(filter),
    );
  }, [filter, projects]);

  const featured = filter === "All" ? projects[0] : null;
  const rest = featured ? projects.slice(1) : visible;

  const menuItem = (label: string) => {
    const selected = filter === label;
    return (
      <button
        key={label}
        type="button"
        role="menuitemradio"
        aria-checked={selected}
        onClick={() => {
          setFilter(label);
          setOpen(false);
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left font-body text-[13px] transition-colors duration-200 ${
          selected
            ? "bg-sienna/15 text-sienna-bright"
            : "text-ivory/70 hover:bg-espresso/70 hover:text-ivory"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
              selected ? "bg-sienna-bright" : "bg-transparent"
            }`}
          />
          <span className="truncate">{label === "All" ? "All work" : label}</span>
        </span>
        <span className="font-display text-[11px] font-semibold tabular-nums text-ivory/35">
          {label === "All" ? projects.length : countFor(label)}
        </span>
      </button>
    );
  };

  return (
    <div>
      {/* Toolbar - a single filter button, the count on the far side */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={`inline-flex items-center gap-3 rounded-full border px-5 py-2.5 transition-all duration-300 ${
              open || filter !== "All"
                ? "border-sienna-bright/70 text-sienna-bright"
                : "border-olive/35 text-ivory/70 hover:border-sienna-bright/50 hover:text-sienna-bright"
            }`}
          >
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/40">
              {ui.filter}
            </span>
            <span className="font-display text-[13px] font-semibold tracking-wide">
              {filter === "All" ? ui.all : filter}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                role="menu"
                aria-label={ui.menuLabel}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-[calc(100%+10px)] z-40 w-[min(26rem,calc(100vw-3rem))] rounded-[0.875rem] border border-olive/25 bg-umber p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
              >
                {menuItem("All")}
                <div className="mt-2 grid grid-cols-2 gap-x-2 border-t border-olive/15 pt-2">
                  <div>
                    <p className="px-3 pb-1 pt-2 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/35">
                      {ui.industry}
                    </p>
                    {industries.map(menuItem)}
                  </div>
                  <div>
                    <p className="px-3 pb-1 pt-2 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/35">
                      {ui.service}
                    </p>
                    {services.map(menuItem)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p
          className="font-body text-xs uppercase tracking-[0.18em] text-ivory/40"
          aria-live="polite"
        >
          {ui.showingA} {visible.length} {ui.showingB} {projects.length} {ui.showingC}
        </p>
      </div>

      {/* Featured case - the strongest story gets the most ground */}
      {featured && (
        <motion.article layout className="mt-10">
          <Link
            href={`/work/${featured.slug}`}
            className="card-surface group grid overflow-hidden lg:grid-cols-12"
          >
            <div className={`relative min-h-[280px] overflow-hidden bg-gradient-to-br lg:min-h-full lg:col-span-6 ${featured.gradient}`}>
              <span
                aria-hidden="true"
                className="absolute -bottom-10 left-6 select-none font-display text-[15rem] font-semibold leading-none tracking-tight text-espresso/20 transition-transform duration-700 ease-read group-hover:scale-[1.04] lg:text-[19rem]"
              >
                {featured.client.split(" ").map((w) => w[0]).join("")}
              </span>
              <span className="absolute left-6 top-6 rounded-full bg-espresso/60 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-widest text-ivory backdrop-blur-sm">
                {featured.industry}
              </span>
              <span className="absolute bottom-6 left-6 rounded-lg border border-espresso/30 bg-espresso/55 px-4 py-2.5 backdrop-blur-md">
                <span className="font-display text-3xl font-semibold text-ivory tabular-nums">
                  {featured.stats[0].value}
                </span>
                <span className="ml-2.5 font-body text-xs text-ivory/65">
                  {featured.stats[0].label.toLowerCase()}
                </span>
              </span>
            </div>

            <div className="flex flex-col p-8 md:p-10 lg:col-span-6">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">
                {ui.featured}
              </p>
              <h2 className="mt-4 font-display text-display-3 font-semibold leading-tight text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                {featured.client}
              </h2>
              <p className="body-copy mt-3 font-body text-lead leading-relaxed text-ivory/60">
                {featured.title}
              </p>

              {/* Hover drawer - the challenge and the disciplines */}
              <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-read group-hover:grid-rows-[1fr] group-hover:opacity-100 [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100">
                <div className="overflow-hidden">
                  <p className="mt-4 border-l-2 border-sienna/50 pl-4 font-body text-sm leading-relaxed text-ivory/55">
                    {featured.challenge}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {featured.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-olive/25 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-ivory/45"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {featured.stats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-olive/20 bg-espresso/40 px-4 py-3">
                    <p className="font-display text-lg font-semibold text-ivory/90 tabular-nums">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 font-body text-[11px] leading-snug text-ivory/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-olive/20 pt-6">
                <span className="font-body text-xs text-ivory/40">
                  {featured.timeline} {ui.engagement}
                </span>
                <span className="inline-flex items-center gap-2 font-display text-sm font-semibold text-sienna-bright">
                  {ui.read}
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </motion.article>
      )}

      <motion.div layout className="mt-7 grid gap-7 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {rest.map((project) => (
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
                  className="card-surface group flex h-full flex-col"
                >
                  <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${project.gradient}`}>
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-5 left-5 select-none font-display text-[7rem] font-semibold leading-none tracking-tight text-espresso/20 transition-transform duration-500 ease-read group-hover:scale-105"
                    >
                      {project.client.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span className="absolute left-5 top-5 rounded-full bg-espresso/60 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-widest text-ivory backdrop-blur-sm">
                      {project.industry}
                    </span>
                    <span className="absolute bottom-5 right-5 rounded-lg border border-espresso/30 bg-espresso/55 px-4 py-2 backdrop-blur-md">
                      <span className="font-display text-xl font-semibold text-ivory tabular-nums transition-colors duration-300 group-hover:text-sienna-bright">
                        {project.stats[0].value}
                      </span>
                      <span className="ml-2 font-body text-[11px] text-ivory/60">
                        {project.stats[0].label.toLowerCase()}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="font-display text-2xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                      {project.client}
                    </h3>
                    <p className="body-copy mt-2 font-body text-sm leading-relaxed text-ivory/55">
                      {project.title}
                    </p>

                    {/* Hover drawer - the story hook plus disciplines.
                        On touch devices it rests open. */}
                    <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-read group-hover:grid-rows-[1fr] group-hover:opacity-100 [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100">
                      <div className="overflow-hidden">
                        <p className="mt-4 border-l-2 border-sienna/50 pl-4 font-body text-[13px] leading-relaxed text-ivory/50">
                          {project.challenge}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.services.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-olive/25 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-ivory/45"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="grid grid-cols-2 gap-3">
                        {project.stats.slice(1, 3).map((stat) => (
                          <div key={stat.label} className="rounded-lg border border-olive/20 bg-espresso/40 px-4 py-3">
                            <p className="font-display text-lg font-semibold text-ivory/90 tabular-nums">
                              {stat.value}
                            </p>
                            <p className="mt-0.5 font-body text-[11px] leading-snug text-ivory/45">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-olive/20 pt-5">
                        <span className="font-body text-xs text-ivory/40">
                          {project.timeline} {ui.engagement}
                        </span>
                        <span className="inline-flex items-center gap-2 font-display text-sm font-semibold text-sienna-bright">
                          {ui.read}
                          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
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
          {ui.empty}
        </p>
      )}
    </div>
  );
}