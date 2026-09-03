import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";

/**
 * PageHero — shared inner-page hero over the cinematic backdrop
 * (mesh, rays, blades, motes, grain).
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-48">
      <HeroBackdrop motes={false} />
      <div className="section-shell relative z-10">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-balance font-display text-display-1 font-semibold text-ivory">
            {title}
          </h1>
          {lead && (
            <p className="body-copy mt-6 font-body text-lead text-ivory/65">{lead}</p>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
