"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { POSTS } from "@/lib/data";
import { useSound } from "@/components/layout/SoundProvider";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * TopicMenu - the Insights filter, as a disclosure: one quiet
 * button names the current topic; the full topic list lives
 * behind it. Selecting an option refilters the library live.
 */
function TopicMenu({
  topics,
  filter,
  onSelect,
}: {
  topics: { name: string; count: number }[];
  filter: string;
  onSelect: (topic: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { click } = useSound();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = filter === "All" ? "All topics" : filter;

  return (
    <div ref={rootRef} className="relative flex items-center gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          click();
          setOpen((v) => !v);
        }}
        className={`flex items-center gap-3 rounded-full border px-5 py-2.5 font-display text-[13px] font-semibold tracking-wide transition-colors duration-300 ${
          open || filter !== "All"
            ? "border-sienna-bright/60 text-sienna-bright"
            : "border-olive/35 text-ivory/70 hover:border-sienna-bright/50 hover:text-sienna-bright"
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M2.5 4.5h15l-5.8 7v4l-3.4 1.9v-5.9z" strokeLinejoin="round" />
        </svg>
        {label}

        <svg
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {filter !== "All" && (
        <button
          type="button"
          aria-label="Clear topic filter"
          onClick={() => onSelect("All")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-sienna-bright/40 text-sienna-bright transition-colors duration-200 hover:bg-sienna-bright hover:text-espresso"
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full z-30 mt-3 w-64 rounded-xl border border-olive/30 bg-umber p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
          >
            <p className="px-3.5 pb-1.5 pt-2.5 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/35">
              Filter by topic
            </p>
            <ul className="pb-1">
              {topics.map((t) => {
                const active = filter === t.name;
                return (
                  <li key={t.name}>
                    <button
                      type="button"
                      onClick={() => {
                        click();
                        onSelect(t.name);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left font-body text-sm transition-colors duration-200 ${
                        active
                          ? "bg-sienna/12 text-sienna-bright"
                          : "text-ivory/75 hover:bg-espresso hover:text-ivory"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-sienna-bright" : "bg-olive/50"}`} />
                        {t.name === "All" ? "All topics" : t.name}
                      </span>
                      <span className="font-display text-[11px] font-semibold tabular-nums text-ivory/35">
                        {t.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * BlogList - the Insights library.
 * The newest post leads as a full-width cover story; the topic
 * menu (a single quiet button) refilters the grid live. Built
 * for readers: generous excerpts, authors, and reading times.
 */
export function BlogList() {
  const [filter, setFilter] = useState("All");

  const topics = useMemo(
    () => [
      { name: "All", count: POSTS.length },
      ...Array.from(new Set(POSTS.map((p) => p.category))).map((c) => ({
        name: c,
        count: POSTS.filter((p) => p.category === c).length,
      })),
    ],
    [],
  );

  const visible = useMemo(
    () =>
      filter === "All" ? POSTS : POSTS.filter((p) => p.category === filter),
    [filter],
  );

  const featured = filter === "All" ? visible[0] : null;
  const rest = featured ? visible.slice(1) : visible;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TopicMenu topics={topics} filter={filter} onSelect={setFilter} />
        <p className="font-body text-xs uppercase tracking-[0.18em] text-ivory/40" aria-live="polite">
          {visible.length} article{visible.length === 1 ? "" : "s"}
          {filter !== "All" ? " - " + filter : ""}
        </p>
      </div>

      {featured && (
        <motion.article layout className="mt-10">
          <Link
            href={`/blog/${featured.slug}`}
            className="card-surface group grid overflow-hidden lg:grid-cols-12"
          >
            <div className="relative min-h-[280px] overflow-hidden lg:col-span-7">
              <Image
                src={featured.cover}
                alt={featured.title}
                width={1600}
                height={900}
                unoptimized
                priority
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-read group-hover:scale-[1.04]"
              />
              <span className="absolute left-6 top-6 rounded-full bg-sienna px-4 py-1.5 font-display text-[11px] font-semibold uppercase tracking-widest text-espresso">
                Latest
              </span>
            </div>
            <div className="flex flex-col p-8 md:p-10 lg:col-span-5">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                {featured.category}
              </p>
              <h2 className="mt-4 font-display text-display-3 font-semibold leading-tight text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                {featured.title}
              </h2>
              <p className="body-copy mt-4 flex-1 font-body text-[15px] leading-relaxed text-ivory/55">
                {featured.excerpt}
              </p>
              <div className="mt-7 flex items-center gap-4 border-t border-olive/20 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sienna/15 font-display text-xs font-semibold text-sienna-bright">
                  {featured.author.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <p className="font-body text-sm font-medium text-ivory/80">{featured.author}</p>
                  <p className="font-body text-xs text-ivory/40">
                    {formatDate(featured.date)} - {featured.readTime} read
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.article>
      )}

      <motion.div layout className="mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {rest.map((post) => (
            <motion.article
              key={post.slug}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="card-surface group flex h-full flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    width={1600}
                    height={900}
                    unoptimized
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-read group-hover:scale-[1.05]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-espresso/65 px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-widest text-ivory backdrop-blur-sm">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {post.title}
                  </h3>
                  <p className="body-copy mt-3 line-clamp-3 flex-1 font-body text-[13px] leading-relaxed text-ivory/50">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-olive/20 pt-4">
                    <span className="truncate font-body text-xs text-ivory/45">{post.author}</span>
                    <span className="shrink-0 font-body text-xs text-ivory/40">{formatDate(post.date)} - {post.readTime}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="mt-16 text-center font-accent text-xl italic text-ivory/45">
          Nothing here yet - but the market keeps writing material.
        </p>
      )}
    </div>
  );
}