"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. A database blip or a bad CMS value should not
 * show Next's bare “Application error” screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side errors are captured by instrumentation.ts; this keeps the
    // digest visible in the browser console for support.
    console.error("[route error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-espresso">
      <div className="section-shell relative z-10 py-32 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-display-3 font-semibold text-ivory">
          The thread broke here.
        </h1>
        <p className="mx-auto mt-5 max-w-md font-body text-base leading-relaxed text-ivory/70">
          A page failed to render. Try again — if it keeps happening, write to{" "}
          <a href="mailto:hello@zoolyum.com" className="text-sienna-bright underline underline-offset-2">
            hello@zoolyum.com
          </a>
          .
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back to the homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
