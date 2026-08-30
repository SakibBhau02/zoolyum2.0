import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Brand strategy, digital design, growth marketing, content, and video — five ways we strengthen your position.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Five ways to strengthen <span className="accent-word">your position.</span>
          </>
        }
        lead="Every service is framed the same honest way: the problem you're living with, what we do about it, and what you walk away holding."
      />

      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Service list">
        <div className="section-shell space-y-8">
          {SERVICES.map((service, i) => (
            <Reveal key={service.slug} delay={i * 60}>
              <Link
                href={`/services/${service.slug}`}
                className="card-surface group grid gap-8 p-8 md:grid-cols-12 md:p-12"
              >
                <div className="md:col-span-5">
                  <span className="font-display text-sm font-semibold tracking-widest text-sienna">
                    0{i + 1}
                  </span>
                  <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                    {service.name}
                  </h2>
                  <p className="mt-3 font-accent text-lg italic text-ivory/55">
                    {service.tagline}
                  </p>
                  <span className="btn-ghost mt-6 inline-flex font-display text-sm font-semibold text-sienna-bright">
                    Explore this service
                    <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>

                <div className="space-y-7 md:col-span-7 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
                  <div>
                    <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45">
                      The problem
                    </h3>
                    <p className="body-copy mt-3 font-body text-[15px] leading-relaxed text-ivory/60">
                      {service.problem}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/45">
                      What you get
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {service.deliverables.slice(0, 3).map((item) => (
                        <li key={item} className="flex items-start gap-2.5 font-body text-[15px] text-ivory/70">
                          <svg viewBox="0 0 16 16" className="mt-1 h-3.5 w-3.5 shrink-0 text-sienna" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                            <path d="m3 8.5 3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
