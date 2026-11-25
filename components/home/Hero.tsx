import { LinkButton } from "@/components/ui/LinkButton";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";

export type HeroCopy = {
  eyebrow: string;
  titleA: string;
  titleAccent: string;
  titleB: string;
  sub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryHref: string;
  ctaSecondaryHref: string;
  hint: string;
};

/**
 * The landing hero — the held breath.
 *
 * Deliberately a server component: the only motion is the CSS `first-read`
 * reveal, and the two client pieces (backdrop, buttons) own their own
 * boundaries. Chapter 01 now starts immediately below this section.
 */
export function Hero({ copy }: { copy: HeroCopy }) {
  return (
    <section
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-espresso"
      aria-label="Consultancy. Strategy. Solution."
    >
      <HeroBackdrop />

      <span className="pulse-wrap left-[16%] top-[26%] md:left-[21%]" aria-hidden="true">
        <span className="ripple-ring" />
        <span className="ripple-ring" />
        <span className="pulse-dot block" />
      </span>

      <div className="section-shell relative z-10 py-32 text-center">
        <p className="first-read eyebrow mx-auto inline-block" style={{ animationDelay: "0ms" }}>
          {copy.eyebrow}
        </p>
        <h1
          className="first-read first-read-slow mx-auto mt-7 max-w-4xl font-display text-display-1 font-semibold text-ivory"
          style={{ animationDelay: "90ms" }}
        >
          {copy.titleA} <span className="accent-word">{copy.titleAccent}</span> {copy.titleB}
        </h1>
        <p
          className="first-read body-copy mx-auto mt-7 font-body text-lead text-ivory/65"
          style={{ animationDelay: "160ms" }}
        >
          {copy.sub}
        </p>
        <div
          className="first-read mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "220ms" }}
        >
          <LinkButton href={copy.ctaPrimaryHref}>{copy.ctaPrimary}</LinkButton>
          <LinkButton href={copy.ctaSecondaryHref} variant="secondary">
            {copy.ctaSecondary}
          </LinkButton>
        </div>
      </div>

      <div
        className="first-read absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center"
        style={{ animationDelay: "300ms" }}
        aria-hidden="true"
      >
        <p className="whitespace-nowrap font-body text-[10px] font-medium tracking-[0.2em] text-ivory/66">
          {copy.hint}
        </p>
      </div>
    </section>
  );
}
