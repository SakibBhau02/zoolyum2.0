"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/lib/hooks";
import { lockScroll, unlockScroll } from "@/lib/smooth-scroll";
import { createLead } from "@/app/admin/actions";
import { fireBrowserLead, newLeadContext } from "@/lib/tracking-client";

const SHOWN_KEY = "zyl-exit-shown";
const EXCLUDED_PATHS = ["/contact", "/resources"];

/**
 * ExitIntentModal — lead capture point 5 (spec 14.1).
 * Desktop only, one time per session, triggered only by exit-intent
 * cursor movement — never by scroll or a time delay. Recovers
 * otherwise-lost visitors without interrupting active reading.
 */
export function ExitIntentModal({ emailConfigured = false }: { emailConfigured?: boolean }) {
  const pathname = usePathname();
  const desktop = useMediaQuery("(pointer: fine) and (min-width: 1024px)");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const eligibleSince = useRef<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const excluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!desktop || excluded) return;
    if (sessionStorage.getItem(SHOWN_KEY) === "1") return;

    eligibleSince.current = Date.now();

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY > 0 || e.relatedTarget !== null) return;
      // Require at least 10s on the page before the offer is fair
      if (Date.now() - eligibleSince.current < 10000) return;
      sessionStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("keydown", onKey);
    };
  }, [desktop, excluded, pathname]);

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    return () => {
      unlockScroll();
    };
  }, [open]);

  // Focus management: move into the dialog, trap Tab, restore on close.
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])'));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previousFocus.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  const emailTrimmed = email.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-espresso/80 backdrop-blur-sm"
      />
      <div ref={panelRef} className="card-surface relative w-full max-w-md p-9">
        <span className="thread absolute left-0 right-0 top-0" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ivory/66 transition-colors hover:text-ivory"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
          </svg>
        </button>

        <p className="eyebrow">Before you go</p>
        <h2 id="exit-modal-title" className="mt-4 font-display text-2xl font-semibold text-ivory">
          The Brand Audit Checklist — free.
        </h2>
        <p className="body-copy mt-3 font-body text-sm leading-relaxed text-ivory/60">
          27 questions to find where your brand is invisible. The same tool
          we use on every engagement kickoff.
        </p>

        {done ? (
          <p className="mt-6 font-accent text-lg italic text-sienna-bright">
            {emailConfigured
              ? `Check your inbox — we'll send the checklist to ${emailTrimmed} within one working day.`
              : "Request received. We'll email the checklist to you within one working day."}
          </p>
        ) : (
          <form
            className="mt-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const value = email.trim();
              if (!value || busy || done) return;
              setBusy(true);
              setError("");
              const ctx = newLeadContext();
              try {
                const r = await createLead("exit-intent", { email: value }, ctx);
                if (r.ok) {
                  fireBrowserLead("exit-intent", ctx);
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
            <label htmlFor="exit-email" className="sr-only">
              Work email
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="exit-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your work email"
                disabled={busy}
                className="w-full rounded-lg border border-olive/35 bg-espresso px-4 py-3 font-body text-sm text-ivory placeholder:text-ivory/66 transition-colors focus:border-sienna-bright/70 focus:outline-none"
              />
              <button type="submit" disabled={busy} className="btn btn-primary shrink-0 !px-5 !text-sm disabled:opacity-70">
                {busy ? "Sending…" : "Send it"}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-3 font-body text-xs text-sienna-bright">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
