import Link from "next/link";
import { getSetting } from "@/lib/content";

/**
 * SkipPrompt — lead capture point 1 (spec 14.1).
 * At the end of Chapter 1: a small, low-friction inline branch for
 * visitors hooked by the narrative payoff who want proof now.
 */
export async function SkipPrompt() {
  const [text, cta, href] = await Promise.all([
    getSetting("home.skip.text", "Hooked already?"),
    getSetting("home.skip.cta", "See how we help brands cut through — skip to our work"),
    getSetting("home.skip.href", "/work"),
  ]);
  return (
    <div className="relative bg-espresso py-12 text-center" data-lead-inline>
      <p className="font-body text-sm text-ivory/45">{text}</p>
      <Link
        href={href}
        className="btn-ghost mt-3 inline-flex font-display text-sm font-semibold text-sienna-bright"
      >
        {cta}
        <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
