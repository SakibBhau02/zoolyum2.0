"use client";

import Script from "next/script";

const SCRIPT_ID = "ms-clarity-tag";

/**
 * Microsoft Clarity.
 *
 * Rendered only through `ConsentGate`. Uses Clarity's official loader so the
 * `window.clarity` command queue exists before the tag runs — injecting the
 * bare script URL left `clarity` undefined and threw on every page that
 * loaded it.
 */
export function MicrosoftClarity({ id }: { id: string }) {
  const snippet = `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", ${JSON.stringify(id)});`;

  return (
    <Script id={SCRIPT_ID} strategy="afterInteractive">
      {snippet}
    </Script>
  );
}
