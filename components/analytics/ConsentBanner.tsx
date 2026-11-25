"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "zy_consent";

type Choice = "granted" | "denied";

function apply(choice: Choice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* private mode */
  }
  const granted = choice === "granted";
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    __zy_consent?: boolean;
  };
  const state = granted ? "granted" : "denied";
  w.__zy_consent = granted;
  w.gtag?.("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
  w.gtag?.("set", "ads_data_redaction", !granted);
  // Meta Pixel has its own consent switch; Clarity is injected only after
  // the `zy:consent` event below.
  w.fbq?.("consent", granted ? "granted" : "revoke");
  // Withdrawing consent should also remove the analytics cookies already set.
  if (!granted) {
    for (const pair of document.cookie.split(";")) {
      const name = pair.split("=")[0]?.trim();
      if (!name) continue;
      if (name.startsWith("_ga") || name.startsWith("_gid") || name.startsWith("_cl") || name.startsWith("_fb")) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    }
  }
  w.dataLayer?.push({ event: "consent_update", consent: choice });
  try {
    window.dispatchEvent(new Event("zy:consent"));
  } catch {
    /* older browsers */
  }
}

/** "unset" until the visitor chooses; "ready" once a choice exists. */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getSnapshot(): "unset" | "ready" {
  try {
    return localStorage.getItem(KEY) === null ? "unset" : "ready";
  } catch {
    return "ready";
  }
}

/** Hide during SSR so the banner never flashes before hydration. */
function getServerSnapshot(): "unset" | "ready" {
  return "ready";
}

/**
 * Minimal, accessible consent banner. Only rendered when
 * `analytics.consent_mode` is "on" in Settings. Both choices are equally
 * prominent — no dark patterns.
 */
export function ConsentBanner() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  const choose = useCallback((choice: Choice) => {
    apply(choice);
    setDismissed(true);
  }, []);

  if (stored === "ready" || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-xl border border-olive/40 bg-espresso/98 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md sm:inset-x-auto sm:right-4 sm:bottom-4 sm:mx-0 sm:max-w-md sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="font-body text-xs leading-relaxed text-ivory/80 sm:flex-1">
          We use analytics and advertising cookies to understand what works. You can accept them or continue with
          essential storage only.{" "}
          <Link href="/privacy-policy" prefetch={false} className="text-sienna-bright underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-lg border border-olive/50 px-4 py-2 font-body text-xs font-semibold text-ivory/80 transition-colors hover:border-ivory/60 hover:text-ivory"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-lg bg-sienna-bright px-4 py-2 font-body text-xs font-semibold text-espresso transition-colors hover:bg-sienna"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
