"use client";

import { useEffect, useState } from "react";

/**
 * ShareButtons - copy-link + share targets for articles.
 * All URLs resolve at click time from the live address, so the
 * server render and the first client render are identical
 * (no hydration mismatch) on previews and production alike.
 */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const open = (make: (url: string, title: string) => string) => () => {
    window.open(make(window.location.href, title), "_blank", "noopener,noreferrer");
  };

  const targets = [
    {
      label: "Share on X",
      make: (url: string, text: string) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      path: "M4 4l7.2 9.3L4.4 20h2.5l5.4-5.4 4.1 5.4H20l-7.5-9.7L19.4 4h-2.5l-4.9 5L8.2 4H4z",
    },
    {
      label: "Share on LinkedIn",
      make: (url: string) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      path: "M6.5 8.8v11.4H3V8.8h3.5zM4.7 3.5a2 2 0 1 1 0 4.1 2 2 0 0 1 0-4.1zM20 13.4v6.8h-3.5v-6c0-1.5-.6-2.5-2-2.5-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1v5.1H9V8.8h3.5v1.5c.5-.7 1.3-1.8 3.2-1.8 2.3 0 4.3 1.5 4.3 4.9z",
    },
    {
      label: "Share on Facebook",
      make: (url: string) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      path: "M13.5 20v-7h2.4l.4-3h-2.8V8.1c0-.9.3-1.5 1.6-1.5h1.3V4s-1.1-.2-2.2-.2c-2.2 0-3.7 1.3-3.7 3.8V10H8v3h2.5v7h3z",
    },
  ];

  return (
    <div className="flex items-center gap-2" aria-label="Share this article">
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className="flex h-10 items-center gap-2 rounded-full border border-olive/35 px-4 font-body text-xs font-medium text-ivory/70 transition-colors duration-200 hover:border-sienna-bright/60 hover:text-sienna-bright"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-sienna-bright" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1" strokeLinecap="round" />
            </svg>
            Copy link
          </>
        )}
      </button>
      {targets.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={open(s.make)}
          aria-label={s.label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-olive/35 text-ivory/70 transition-colors duration-200 hover:border-sienna-bright/60 hover:text-sienna-bright"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d={s.path} />
          </svg>
        </button>
      ))}
    </div>
  );
}