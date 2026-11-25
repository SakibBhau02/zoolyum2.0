"use client";

import { useEffect, useState, type ReactNode } from "react";

declare global {
  interface Window {
    __zy_consent?: boolean;
  }
}

/**
 * Keep third-party tags off the page until the visitor accepts.
 *
 * Consent Mode alone still downloads GTM/GA on first paint. That is legal in
 * some regions, but it costs main-thread time and sets cookies before a
 * choice. This gate renders the tags only when `analytics.consent_mode` is on
 * *and* the visitor granted consent. When the banner is off (outside the EEA),
 * tags load immediately as before.
 *
 * `window.__zy_consent` is written by ConsentScript before hydration;
 * ConsentBanner dispatches `zy:consent` when the choice changes.
 */
export function ConsentGate({
  children,
  requireConsent,
}: {
  children: ReactNode;
  requireConsent: boolean;
}) {
  const [allowed, setAllowed] = useState(!requireConsent);

  useEffect(() => {
    if (!requireConsent) return;
    const check = () => setAllowed(window.__zy_consent === true);
    // Defer the first read one frame so the effect does not trigger a
    // synchronous cascading render during hydration.
    const frame = requestAnimationFrame(check);
    window.addEventListener("zy:consent", check);
    window.addEventListener("storage", check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("zy:consent", check);
      window.removeEventListener("storage", check);
    };
  }, [requireConsent]);

  return allowed ? <>{children}</> : null;
}
