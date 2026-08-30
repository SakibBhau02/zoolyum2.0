import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Field, FormShell, SubmitButton } from "@/components/pages/Forms";
import { JOBS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the team — open roles at Zoolyum, a brand strategy & digital innovation agency in Dhaka.",
};

const BENEFITS = [
  { title: "Work that ships", detail: "Nothing here dies in a deck. Everything you make faces the market." },
  { title: "Results bonus", detail: "Quarterly bonus tied to client outcomes — when the work lands, you land." },
  { title: "Learning budget", detail: "Courses, conferences, and books on us. Sharp minds stay sharp." },
  { title: "No ego policy", detail: "Ideas win on merit, not seniority. Interns have improved founder ideas here." },
  { title: "Flexible studio", detail: "Hybrid work, flexible hours. We measure output, not chair time." },
  { title: "Health cover", detail: "Full health insurance for you and your family. Peace of mind is a benefit." },
] as const;

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={
          <>
            Consultancy-grade work, <span className="accent-word">studio pace.</span>
          </>
        }
        lead="We're small, fast, and allergic to mediocrity. If you'd rather ship ten considered things than plan one safe thing, you'll fit right in."
      />

      <section className="relative overflow-hidden pb-20 md:pb-28" aria-label="Why work at Zoolyum">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Why Zoolyum"
            title={
              <>
                The rules of <span className="text-ivory/55">our studio.</span>
              </>
            }
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit, i) => (
              <Reveal key={benefit.title} delay={(i % 3) * 80}>
                <div className="card-surface group h-full p-7">
                  <span className="thread block w-10 transition-all duration-500 group-hover:w-16" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-lg font-semibold text-ivory">
                    {benefit.title}
                  </h3>
                  <p className="body-copy mt-3 font-body text-sm leading-relaxed text-ivory/55">
                    {benefit.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-y border-olive/15 bg-umber/40 py-20 md:py-28"
        aria-label="Open positions"
      >
        <div className="section-shell">
          <SectionHeading
            eyebrow="Open Roles"
            title={
              <>
                Positions <span className="accent-word">open now.</span>
              </>
            }
          />
          <div className="mt-14 space-y-4">
            {JOBS.map((job, i) => (
              <Reveal key={job.title} delay={i * 60}>
                <a href="#apply" className="card-surface group flex flex-wrap items-center justify-between gap-4 p-7">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                      {job.title}
                    </h3>
                    <p className="mt-1.5 font-body text-sm text-ivory/50">
                      {job.dept} · {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="rounded-full border border-olive/35 px-4 py-1.5 font-body text-xs font-semibold tracking-wide text-ivory/65">
                      {job.type}
                    </span>
                    <svg viewBox="0 0 20 20" className="h-5 w-5 text-sienna-bright transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="relative overflow-hidden py-20 md:py-28" aria-label="Apply">
        <div className="section-shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Apply"
              title={
                <>
                  Show us <span className="accent-word">your judgment.</span>
                </>
              }
              lead="No cover-letter theatre. Tell us what you've made and why it was the right call. We read every application ourselves."
            />
          </div>
          <div className="lg:col-span-7">
            <Reveal>
              <div className="card-surface p-8 md:p-10">
                <FormShell className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" name="name" required />
                    <Field label="Email" name="email" type="email" required />
                  </div>
                  <Field
                    label="Position"
                    name="position"
                    required
                    options={[...JOBS.map((job) => job.title), "Speculative application"]}
                  />
                  <Field
                    label="Why you? (the honest version)"
                    name="message"
                    textarea
                    required
                    placeholder="Tell us what you've made and why it mattered"
                  />
                  <Field
                    label="Resume (PDF)"
                    name="resume"
                    file
                    accept=".pdf,.doc,.docx"
                    required
                  />
                  <SubmitButton label="Submit application" />
                </FormShell>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
