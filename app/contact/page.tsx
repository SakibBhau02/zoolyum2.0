import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ContactWizard } from "@/components/pages/ContactWizard";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { CONTACT, CONTACT_FAQS, SITE_URL, TESTIMONIALS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Start a Conversation",
  description:
    "Tell us where your brand blends in. One guided conversation, a reply within one working day - Zoolyum, brand strategy and digital innovation agency, Mirpur 11, Dhaka.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Start a Conversation | Zoolyum",
    description: "Tell us where your brand blends in. One guided conversation, a reply within one working day - Zoolyum, Mirpur 11, Dhaka.",
    url: "/contact",
  },
  twitter: {
    card: "summary",
    title: "Start a Conversation | Zoolyum",
    description: "Tell us where your brand blends in. One guided conversation, a reply within one working day - Zoolyum, Mirpur 11, Dhaka.",
  },
};

const AFTER_SEND = [
  {
    title: "We reply within one working day",
    body: "A strategist - not a bot, not a form letter - reads your note and writes back.",
  },
  {
    title: "A 30-minute discovery call",
    body: "We ask sharp questions and map where you stand. No pitch deck, no obligation.",
  },
  {
    title: "A tailored proposal",
    body: "Scope, timeline, and investment in plain language - usually within days.",
  },
];

const QUOTE = TESTIMONIALS[1];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${SITE_URL}/contact#page`,
      url: `${SITE_URL}/contact`,
      name: "Start a Conversation with Zoolyum",
      description:
        "Contact Zoolyum - brand strategy and digital innovation agency in Dhaka. Guided conversation form, reply within one working day.",
      mainEntity: {
        "@type": "Organization",
        name: "Zoolyum",
        url: SITE_URL,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          email: CONTACT.email,
          telephone: CONTACT.phone,
          areaServed: "BD",
          availableLanguage: ["English", "Bengali"],
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: CONTACT_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s read your market <span className="accent-word">together.</span>
          </>
        }
        lead="One conversation. Thirty minutes. A clear read on where your brand blends in - and what it takes to stand apart. We reply within one working day."
      />

      <section className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-16" aria-label="Start a conversation">
        <div className="dappled dappled--alt" aria-hidden="true" />
        <div className="section-shell relative z-10 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <ContactWizard />
          </Reveal>

          <Reveal delay={140} className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6">
              <div className="card-surface p-8">
                <h2 className="eyebrow">After you press send</h2>
                <ol className="mt-7">
                  {AFTER_SEND.map((s, i) => (
                    <li
                      key={s.title}
                      className="grid grid-cols-[auto_1fr] items-start gap-x-4 pb-7 last:pb-0"
                    >
                      <span className="relative flex flex-col items-center">
                        <span
                          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-sienna-bright font-display text-[11px] font-bold text-espresso shadow-[0_0_16px_-2px_rgba(255,80,1,0.55)]"
                        >
                          {i + 1}
                        </span>
                        {i < AFTER_SEND.length - 1 && (
                          <span className="mt-1 min-h-[20px] w-px flex-1 bg-sienna/20" />
                        )}
                      </span>
                      <div className="pt-0.5">
                        <p className="font-display text-[15px] font-semibold text-ivory">{s.title}</p>
                        <p className="mt-1 font-body text-sm leading-relaxed text-ivory/50">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card-surface p-8">
                <h2 className="eyebrow">Direct lines</h2>
                <address className="mt-6 space-y-4 not-italic">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="group flex items-center gap-4 font-body text-[15px] text-ivory/75 transition-colors hover:text-sienna-bright"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-espresso text-sienna-bright ring-1 ring-sienna/30 transition-colors group-hover:bg-sienna-bright group-hover:text-espresso">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
                        <path d="m3 6 7 5 7-5" strokeLinecap="round" />
                      </svg>
                    </span>
                    {CONTACT.email}
                  </a>
                  <a
                    href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`}
                    className="group flex items-center gap-4 font-body text-[15px] text-ivory/75 transition-colors hover:text-sienna-bright"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-espresso text-sienna-bright ring-1 ring-sienna/30 transition-colors group-hover:bg-sienna-bright group-hover:text-espresso">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <path d="M4 3h4l1.5 4L7 9a11 11 0 0 0 4 4l2-2.5 4 1.5v4a1.5 1.5 0 0 1-1.7 1.5C8.7 16.7 3.3 11.3 2.5 4.7A1.5 1.5 0 0 1 4 3Z" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {CONTACT.phone}
                  </a>
                  <p className="flex items-start gap-4 font-body text-[15px] leading-relaxed text-ivory/75">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-espresso text-sienna-bright ring-1 ring-sienna/30">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <path d="M10 17.5s6-5.1 6-9.5a6 6 0 1 0-12 0c0 4.4 6 9.5 6 9.5Z" strokeLinejoin="round" />
                        <circle cx="10" cy="8" r="2.2" />
                      </svg>
                    </span>
                    {CONTACT.address}
                  </p>
                </address>
              </div>

              <figure className="border-l-2 border-sienna/60 py-1 pl-6">
                <blockquote className="font-body text-[15px] leading-relaxed text-ivory/70">
                  &ldquo;{QUOTE.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 font-body text-xs uppercase tracking-[0.18em] text-ivory/40">
                  {QUOTE.author} &middot; {QUOTE.company}
                </figcaption>
              </figure>

              <a
                href={CONTACT.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-surface group relative flex min-h-[200px] flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-umber via-espresso to-sienna/30 p-8 text-center"
              >
                <span
                  aria-hidden="true"
                  className="absolute -bottom-8 -right-4 select-none font-display text-8xl font-semibold tracking-tight text-sienna/10"
                >
                  Mirpur 11
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sienna-bright text-espresso shadow-[0_0_30px_-4px_rgba(255,80,1,0.6)] transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M10 17.5s6-5.1 6-9.5a6 6 0 1 0-12 0c0 4.4 6 9.5 6 9.5Z" strokeLinejoin="round" />
                    <circle cx="10" cy="8" r="2.2" />
                  </svg>
                </span>
                <span className="mt-5 font-display text-lg font-semibold text-ivory">
                  Find us in Mirpur 11
                </span>
                <span className="mt-1 font-body text-sm text-ivory/50">
                  Open in Google Maps &rarr;
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="border-t border-olive/15 pb-24 pt-16 md:pb-32 md:pt-20"
        aria-label="Frequently asked questions"
      >
        <div className="section-shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow">Before you write</p>
              <h2 className="mt-4 font-display text-display-3 font-semibold text-ivory">
                Answers, before the questions.
              </h2>
              <p className="body-copy mt-4 font-body text-sm leading-relaxed text-ivory/50">
                The four things people ask before their first message.
              </p>
            </Reveal>
          </div>
          <Reveal delay={120} className="lg:col-span-8">
            <FaqAccordion faqs={[...CONTACT_FAQS]} />
          </Reveal>
        </div>
      </section>
    </>
  );
}