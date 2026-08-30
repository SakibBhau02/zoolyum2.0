import { INDUSTRIES_TICKER } from "@/lib/data";
import { MarqueeRow } from "@/components/ui/MarqueeRow";

/**
 * IndustryTicker — a thin, always-moving strip of what we do and
 * the categories we've done it in. Pure ambient motion; decorative.
 */
export function IndustryTicker() {
  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-y border-olive/15 bg-umber/30 py-5"
    >
      <MarqueeRow direction="rtl" duration={44} pauseOnHover={false}>
        {INDUSTRIES_TICKER.map((item) => (
          <span key={item} className="flex shrink-0 items-center gap-6 pr-6">
            <span className="whitespace-nowrap font-display text-sm font-semibold tracking-[0.18em] text-ivory/45">
              {item.toUpperCase()}
            </span>
            <span className="block h-1 w-1 rounded-full bg-sienna/70" />
          </span>
        ))}
      </MarqueeRow>
    </section>
  );
}
