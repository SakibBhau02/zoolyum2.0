"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    /** Consent Mode choice, written by ConsentScript/ConsentBanner. */
    __zy_consent?: boolean;
  }
}

/**
 * App Router page views.
 *
 * The base snippet already tracks the landing PageView, so the mount pass is
 * skipped — otherwise every first visit reported two. Navigations after that
 * send one PageView each, which the Pixel does not do on its own.
 */
function PixelTracker({ id }: { id: string }) {
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  useEffect(() => {
    // The base snippet tracks the landing PageView; this covers navigations.
    // Path comparison (not a boolean) keeps StrictMode's double-mount quiet.
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname, id]);
  return null;
}

export function MetaPixel({ id }: { id: string }) {
  // Meta has no Consent Mode equivalent: revoke storage until the visitor
  // accepts, then grant it from the banner.
  const consentGuard = `if(window.__zy_consent===false){fbq("consent","revoke");}`;
  return (
    <>
      <Script id="meta-pixel" strategy="lazyOnload">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");${consentGuard}fbq("init", "${id}");fbq("track", "PageView");`}
      </Script>
      <Suspense fallback={null}>
        <PixelTracker id={id} />
      </Suspense>
    </>
  );
}
