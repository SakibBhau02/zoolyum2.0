"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const INTRODUCED_KEY = "zyl-audit-introduced";
const DISMISSED_KEY = "zyl-audit-dismissed";

/**
 * AuditTab — lead capture point 2 (spec 14.1).
 * "Get a Free Brand Audit" sticky corner tab, introduced right
 * after the Results chapter (when credibility peaks) and persisting
 * subtly for the rest of the scroll / session.
 *
 * One-prompt rule: hides itself while any inline lead prompt
 * ([data-lead-inline]) is in view, so prompts are sequenced —
 * never stacked.
 */
export function AuditTab() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  // Dismissal is session-persistent
  useEffect(() => {
    requestAnimationFrame(() => {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
    });
  }, []);

  // Homepage: introduce once the work chapter (right after the
  // results) enters the viewport. Other pages: only if already
  // introduced this session, after 40% scroll depth.
  useEffect(() => {
    if (dismissed) return;

    const isHome = pathname === "/";
    if (isHome) {
      const target = document.getElementById("chapter-work");
      if (!target) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setShow(true);
            sessionStorage.setItem(INTRODUCED_KEY, "1");
            observer.disconnect();
          }
        },
        { threshold: 0 }
      );
      observer.observe(target);
      return () => observer.disconnect();
    }

    const introduced = sessionStorage.getItem(INTRODUCED_KEY) === "1";
    if (!introduced) return;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? window.scrollY / scrollable : 0;
      setShow(p > 0.4);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, dismissed]);

  // One-prompt rule: hide while an inline lead prompt is visible
  useEffect(() => {
    if (!show) return;
    const inlinePrompts = Array.from(document.querySelectorAll("[data-lead-inline]"));
    if (inlinePrompts.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting);
        if (anyVisible) setShow(false);
      },
      { threshold: 0.35 }
    );
    inlinePrompts.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [show, pathname]);

  if (dismissed || !show) return null;

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <aside
      role="complementary"
      aria-label="Free brand audit offer"
      className="card-surface fixed bottom-6 right-6 z-40 w-[280px] p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss offer"
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-ivory/40 transition-colors hover:text-ivory"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
        </svg>
      </button>
      <p className="font-display text-lg font-semibold leading-snug text-ivory">
        Get a Free Brand Audit
      </p>
      <p className="body-copy mt-2 font-body text-[13px] leading-relaxed text-ivory/55">
        27 questions to find where your brand is invisible. Ten minutes,
        zero fluff.
      </p>
      <Link href="/resources" className="btn btn-primary mt-5 w-full !px-4 !py-2.5 !text-[13px]">
        Get the checklist
      </Link>
    </aside>
  );
}
