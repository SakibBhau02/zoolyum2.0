import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Field, FormShell, SubmitButton } from "@/components/pages/Forms";
import { CONTACT, SERVICES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Zoolyum — brand strategy & digital innovation agency, Mirpur 11, Dhaka.",
};

const BUDGETS = [
  "Under BDT 1,00,000",
  "BDT 1–3,00,000",
  "BDT 3–8,00,000",
  "BDT 8–15,00,000",
  "BDT 15,00,000+",
  "Not sure yet",
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s read your market <span className="accent-word">together.</span>
          </>
        }
        lead="One conversation. Thirty minutes. We'll map where your brand blends in — and what it takes to stand apart."
      />

      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Contact form and details">
        <div className="section-shell grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="card-surface p-8 md:p-10">
              <h2 className="font-display text-2xl font-semibold text-ivory">
                Tell us about your brand
              </h2>
              <p className="mt-2 font-body text-sm text-ivory/50">
                Fields marked <span className="text-sienna-bright">*</span> are required. We reply within one working day.
              </p>
              <FormShell className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" name="name" required />
                  <Field label="Company / brand" name="company" required />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Phone (optional)" name="phone" type="tel" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Service interest"
                    name="service"
                    required
                    options={[...SERVICES.map((s) => s.name), "Not sure — advise me"]}
                  />
                  <Field label="Budget range" name="budget" required options={BUDGETS} />
                </div>
                <Field
                  label="What are you trying to achieve?"
                  name="message"
                  textarea
                  required
                  placeholder="Tell us about your market, your competitors, and the position you want"
                />
                <SubmitButton label="Start a Conversation" />
              </FormShell>
            </div>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6">
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

              <a
                href={CONTACT.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-surface group relative flex min-h-[220px] flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-umber via-espresso to-sienna/30 p-8 text-center"
              >
                <span aria-hidden="true" className="absolute -bottom-8 -right-4 select-none font-display text-8xl font-semibold tracking-tight text-sienna/10">
                  Mirpur 11
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sienna-bright text-espresso shadow-[0_0_30px_-4px_rgba(201,112,46,0.6)] transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M10 17.5s6-5.1 6-9.5a6 6 0 1 0-12 0c0 4.4 6 9.5 6 9.5Z" strokeLinejoin="round" />
                    <circle cx="10" cy="8" r="2.2" />
                  </svg>
                </span>
                <span className="mt-5 font-display text-lg font-semibold text-ivory">
                  Find us in Mirpur 11
                </span>
                <span className="mt-1 font-body text-sm text-ivory/50">
                  Open in Google Maps →
                </span>
              </a>

              <div className="card-surface border-sienna/25 p-8">
                <p className="eyebrow">Prefer a calendar?</p>
                <p className="body-copy mt-4 font-body text-sm leading-relaxed text-ivory/60">
                  Skip the form. Book a free 30-minute consultation directly —
                  bring your toughest market question.
                </p>
                <a href={`mailto:${CONTACT.email}?subject=Consultation%20Request`} className="btn-ghost mt-5 inline-flex font-display text-sm font-semibold text-sienna-bright">
                  Schedule a consultation
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
