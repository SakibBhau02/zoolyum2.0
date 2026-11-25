"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { fireBrowserLead } from "@/lib/tracking-client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Set when GA4/Ads run directly (no GTM); read by fireBrowserLead. */
    __zy_ads?: { id: string; label: string };
  }
}

/** Fire a conversion event to GA4/Google Ads (if loaded) and Meta Pixel. */
export function trackLead(kind: string) {
  fireBrowserLead(kind);
}

/**
 * Direct gtag loader. Used only when no GTM container is configured.
 * Configures GA4 and, when present, the Google Ads destination.
 *
 * Page views: `gtag("config")` already sends the first one, so the mount pass
 * is skipped. App Router navigations afterwards send an explicit `page_view`
 * with the full URL — the old `config + page_path` call counted the landing
 * page twice and used a parameter GA4 no longer reads.
 */
export function GoogleAnalytics({ id, adsId, adsLabel }: { id: string; adsId?: string; adsLabel?: string }) {
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const primary = id || adsId || "";

  useEffect(() => {
    // The landing page is counted by `gtag("config")`; only navigations after
    // it need an explicit page_view. Comparing paths (instead of a boolean)
    // keeps React StrictMode's double-mount from sending an extra hit.
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (id) {
      window.gtag?.("event", "page_view", {
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, id]);

  useEffect(() => {
    // Google Ads conversion target, consumed by the lead forms. Cleared when
    // GTM owns Ads, because the container sends the conversion itself.
    window.__zy_ads = adsId && adsLabel ? { id: adsId, label: adsLabel } : undefined;
  }, [adsId, adsLabel]);

  if (!primary) return null;

  const init = [
    `window.dataLayer = window.dataLayer || [];`,
    `function gtag(){dataLayer.push(arguments);}`,
    `gtag("js", new Date());`,
    id ? `gtag("config", "${id}");` : "",
    adsId ? `gtag("config", "${adsId}");` : "",
  ]
    .filter(Boolean)
    .join("");

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${primary}`} strategy="lazyOnload" />
      <Script id="ga4-init" strategy="lazyOnload">
        {init}
      </Script>
    </>
  );
}
