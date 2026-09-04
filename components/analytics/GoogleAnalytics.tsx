"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire a conversion event to GA4 (if loaded) and Meta Pixel (if loaded). */
export function trackLead(kind: string) {
  try {
    window.dataLayer?.push({ event: "lead", kind });
    (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "Lead", { content_name: kind });
  } catch {
    /* analytics must never break the form */
  }
}

export function GoogleAnalytics({ id }: { id: string }) {
  const pathname = usePathname();
  useEffect(() => {
    window.gtag?.("config", id, { page_path: pathname });
  }, [pathname, id]);
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag("js", new Date());gtag("config", "${id}");`}
      </Script>
    </>
  );
}
