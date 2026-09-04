import { Reveal, HorizonRule } from "@/components/ui/Reveal";
import { StatCounter } from "@/components/ui/metrics";
import { AccentSplit } from "@/components/ui/AccentSplit";

export type ResultsCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  closing: string;
  stats: { value: number; suffix: string; label: string }[];
};

/**
 * Chapter 4 — The Results.
 * Proof, stated plainly: stat counters on Deep Umber with Sienna
 * numerals. Slow count-up, no flash — precision over spectacle.
 */
export function Chapter4Results({ copy }: { copy: ResultsCopy }) {
  return (
    <section
      id="chapter-results"
      className="relative overflow-hidden bg-umber py-24 md:py-32"
      aria-label="The results"
    >
      <div className="dappled" aria-hidden="true" />
      <div className="section-shell relative z-10">
        <HorizonRule className="mb-16 opacity-50" />
        <Reveal>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-4 max-w-2xl font-display text-display-2 font-semibold text-ivory">
            <AccentSplit text={copy.title} accentClassName="text-ivory/55" />
          </h2>
          <p className="body-copy mt-5 max-w-xl font-body text-lead text-ivory/60">
            {copy.lead}
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 md:mt-20 lg:grid-cols-4">
          {copy.stats.map((stat) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>

        <Reveal delay={150}>
          <p className="body-copy mt-14 max-w-lg font-body text-[15px] leading-relaxed text-ivory/55">
            {copy.closing}
            e-commerce. The pattern holds: give a brand a defensible
            position, and the category takes notice.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
