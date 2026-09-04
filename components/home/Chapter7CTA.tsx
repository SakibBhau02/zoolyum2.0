import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/ui/Reveal";
import { AccentSplit } from "@/components/ui/AccentSplit";
import { getSetting } from "@/lib/content";

/**
 * Chapter 7 — Let's Read Your Market Together.
 * The quiet finale: a soft Terrain Gradient ground, the closing
 * line of the brief, and two considered CTAs.
 */
export async function Chapter7CTA() {
  const [eyebrow, title, lead, primary, secondary] = await Promise.all([
    getSetting("home.cta.eyebrow", ""),
    getSetting("home.cta.title", ""),
    getSetting("home.cta.lead", ""),
    getSetting("home.cta.primary", ""),
    getSetting("home.cta.secondary", ""),
  ]);
  return (
    <section
      className="terrain-gradient-soft relative overflow-hidden"
      aria-label="Let's read your market together"
    >
      <div className="section-shell relative z-10 py-28 text-center md:py-36">
        <Reveal>
          <p className="eyebrow mx-auto inline-block">{eyebrow}</p>
          <h2 className="mx-auto mt-6 max-w-4xl font-display text-display-1 font-semibold text-ivory">
            <AccentSplit text={title} accentClassName="text-ivory/60" />
          </h2>
          <p className="body-copy mx-auto mt-7 font-body text-lead text-ivory/65">
            {lead}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LinkButton href="/contact">{primary}</LinkButton>
            <LinkButton href="/services" variant="secondary">
              {secondary}
            </LinkButton>
          </div>
        </Reveal>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden">
        <p className="translate-y-[30%] bg-gradient-to-b from-ivory/[0.06] to-transparent bg-clip-text text-center font-display text-[15vw] font-semibold leading-none tracking-tight text-transparent">
          ZOOYLUM
        </p>
      </div>
    </section>
  );
}
