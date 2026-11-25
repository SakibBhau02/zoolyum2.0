"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function GtmPageViews() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    try {
      const q = search?.toString();
      const page = q ? `${pathname}?${q}` : pathname;
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
        event: "page_view",
        page,
        // GA4 tags inside GTM read these, not `page`.
        page_location: window.location.href,
        page_title: document.title,
      });
    } catch {
      /* analytics must never break navigation */
    }
  }, [pathname, search]);
  return null;
}

/**
 * GTM container loader. Disable GTM's default Page View trigger and
 * use the manual page_view event above â€” App Router client navigation
 * has no full page load, so the default trigger double-counts / misses.
 */
export function GoogleTagManager({ id }: { id: string }) {
  return (
    <>
      <Script id="gtm-base" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`}
      </Script>
      <Suspense fallback={null}>
        <GtmPageViews />
      </Suspense>
    </>
  );
}
