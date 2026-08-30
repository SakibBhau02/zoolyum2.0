import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Chapter 7 — Let's Read Your Market Together.
 * The quiet finale: a soft Terrain Gradient ground, the closing
 * line of the brief, and two considered CTAs.
 */
export function Chapter7CTA() {
  return (
    <section
      className="terrain-gradient-soft relative overflow-hidden"
      aria-label="Let's read your market together"
    >
      <div className="section-shell relative z-10 py-28 text-center md:py-36">
        <Reveal>
          <p className="eyebrow mx-auto inline-block">Let&apos;s Read Your Market Together</p>
          <h2 className="mx-auto mt-6 max-w-4xl font-display text-display-1 font-semibold text-ivory">
            Somewhere in your market, there&apos;s a pattern only a
            strategist would notice.{" "}
            <span className="text-ivory/60">Let&apos;s find it.</span>
          </h2>
          <p className="body-copy mx-auto mt-7 font-body text-lead text-ivory/65">
            One conversation. Thirty minutes. We&apos;ll show you where your
            brand blends in — and what it takes to stand apart.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LinkButton href="/contact">Start a Conversation</LinkButton>
            <LinkButton href="/services" variant="secondary">
              Explore Our Services
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
