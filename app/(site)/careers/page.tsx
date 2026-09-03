import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Field, FormShell, SubmitButton } from "@/components/pages/Forms";
import { JobBoard, ApplyPositionField } from "@/components/pages/JobBoard";
import { SITE_URL } from "@/lib/data";
import { getJobs, getTeam, getJsonSetting } from "@/lib/content";
import { HIRING_STEPS as TS_STEPS, CAREERS_FAQS as TS_FAQS } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("careers", {
    title: "Careers",
    description: "Join the team - open roles at Zoolyum, a brand strategy & digital innovation agency in Dhaka.",
    canonical: "/careers",
    ogTitle: "Careers | Zoolyum",
    ogDescription: "Join the team - open roles at Zoolyum, a brand strategy & digital innovation agency in Dhaka.",
    card: "summary",
  });
}

const VALUES = [
  { title: "Ship beats plan", detail: "Ten considered things shipped beats one safe thing planned. The market judges output, so do we." },
  { title: "Merit beats seniority", detail: "The best argument wins the room - interns have improved founder ideas here, on record." },
  { title: "Read before you move", detail: "Diagnosis before prescription, in client work and in hiring. Opinions arrive with evidence." },
  { title: "Blunt is kind", detail: "Direct feedback early beats polite silence that wastes months. We critique work, never people." },
] as const;

function employmentType(type: string) {
  return type === "Contract" ? "CONTRACT" : "FULL_TIME";
}

export default async function CareersPage() {
  const [jobs, team, steps, faqs] = await Promise.all([
    getJobs(),
    getTeam(),
    getJsonSetting("hiring.steps", [...TS_STEPS]),
    getJsonSetting("faqs.careers", [...TS_FAQS]),
  ]);
  const jobPostingLd = {
    "@context": "https://schema.org",
    "@graph": jobs.filter((j) => j.detail).map((j) => ({
      "@type": "JobPosting",
      title: j.title,
      description: `${j.detail!.about} Responsibilities: ${j.detail!.responsibilities.join("; ")}.`,
      datePosted: "2026-09-01",
      validThrough: "2026-12-31",
      employmentType: employmentType(j.type),
      hiringOrganization: {
        "@type": "Organization",
        name: "Zoolyum",
        sameAs: SITE_URL,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: "House 11, Road 11, Mirpur 11",
          addressLocality: "Dhaka",
          postalCode: "1216",
          addressCountry: "BD",
        },
      },
    })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f: { q: string; a: string }) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

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

      {/* ---------- Culture ---------- */}
      <section className="relative overflow-hidden pb-20 pt-12 md:pb-28 md:pt-16" aria-label="Studio culture">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Culture"
            title={
              <>
                How we actually <span className="text-ivory/55">work.</span>
              </>
            }
            lead="Four rules run this studio. They are enforced in reviews, in critiques, and in who gets hired - starting with this page."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={(i % 4) * 80}>
                <div className="card-surface group h-full p-7">
                  <span className="thread block w-10 transition-all duration-500 group-hover:w-16" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-lg font-semibold text-ivory">
                    {v.title}
                  </h3>
                  <p className="body-copy mt-3 font-body text-sm leading-relaxed text-ivory/55">
                    {v.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="card-surface relative overflow-hidden p-8 md:p-10">
                <span className="thread absolute left-0 top-0 h-full w-[3px]" aria-hidden="true" />
                <p className="eyebrow">A Tuesday at Zoolyum</p>
                <p className="body-copy mt-5 font-body text-[1.0625rem] leading-[1.8] text-ivory/70">
                  Standup at ten, critiques without rank, client work before
                  internal theatre. You will present unfinished thinking in
                  week one and defend it with evidence, not seniority. Deadlines
                  are real, hours are sane, and nobody measures your chair
                  time - only what faced the market that week.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-5">
              <p className="eyebrow">Who you will sit with</p>
              <ul className="mt-5 space-y-3">
                {team.slice(0, 4).map((m) => (
                  <li key={m.name} className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sienna/15 font-display text-xs font-semibold text-sienna-bright" aria-hidden="true">
                      {m.initials}
                    </span>
                    <div>
                      <p className="font-body text-sm font-medium text-ivory/85">{m.name}</p>
                      <p className="font-body text-xs text-ivory/40">{m.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/team" className="mt-6 inline-flex items-center font-body text-sm font-medium text-sienna-bright underline decoration-sienna/40 underline-offset-4 hover:decoration-sienna-bright">
                Meet the full team
                <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Open roles ---------- */}
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
            lead="Open a role to read the full brief - what you will own, what you need, and what the first 90 days look like."
          />
          <div className="mt-14">
            <JobBoard jobs={jobs} />
          </div>
        </div>
      </section>

      {/* ---------- How we hire ---------- */}
      <section className="relative overflow-hidden py-20 md:py-28" aria-label="Hiring process">
        <div className="section-shell">
          <SectionHeading
            eyebrow="How we hire"
            title={
              <>
                Two weeks, <span className="text-ivory/55">four steps.</span>
              </>
            }
            lead="No silence, no puzzles. You will always know where you stand - if we go quiet, nudge us."
          />
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s: { step: string; detail: string }, i: number) => (
              <Reveal key={s.step} delay={(i % 4) * 80}>
                <li className="card-surface h-full list-none p-7">
                  <p className="font-display text-sm font-semibold text-sienna tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ivory">
                    {s.step}
                  </h3>
                  <p className="body-copy mt-2.5 font-body text-sm leading-relaxed text-ivory/55">
                    {s.detail}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Benefits ---------- */}
      <section
        className="relative overflow-hidden border-t border-olive/15 bg-umber/40 py-20 md:py-28"
        aria-label="Benefits"
      >
        <div className="section-shell">
          <SectionHeading
            eyebrow="Pay, care & growth"
            title={
              <>
                Looked after, <span className="text-ivory/55">sharpened up.</span>
              </>
            }
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Work that ships", detail: "Nothing here dies in a deck. Everything you make faces the market." },
              { title: "Results bonus", detail: "Quarterly bonus tied to client outcomes - when the work lands, you land." },
              { title: "Learning budget", detail: "Courses, conferences, and books on us. Sharp minds stay sharp." },
              { title: "No ego policy", detail: "Ideas win on merit, not seniority. Interns have improved founder ideas here." },
              { title: "Flexible studio", detail: "Hybrid work, flexible hours. We measure output, not chair time." },
              { title: "Health cover", detail: "Full health insurance for you and your family. Peace of mind is a benefit." },
            ].map((benefit, i) => (
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

      {/* ---------- FAQ ---------- */}
      <section className="relative overflow-hidden py-20 md:py-28" aria-label="Careers questions">
        <div className="section-shell">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="Before you apply"
              title={
                <>
                  Fair <span className="accent-word">questions.</span>
                </>
              }
            />
            <div className="mt-10 space-y-3">
              {faqs.map((f: { q: string; a: string }) => (
                <Reveal key={f.q} delay={30}>
                  <details className="faq-item group rounded-xl border border-olive/25 bg-umber/40 transition-colors duration-200 open:border-sienna/40 open:bg-umber/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-[1.05rem] font-semibold leading-snug text-ivory [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-olive/35 text-sienna-bright transition-transform duration-300 group-open:rotate-45">
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                        </svg>
                      </span>
                    </summary>
                    <p className="body-copy px-5 pb-5 font-body text-[15px] leading-relaxed text-ivory/65">
                      {f.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Apply ---------- */}
      <section id="apply" className="relative scroll-mt-28 overflow-hidden border-t border-olive/15 bg-umber/40 py-20 md:py-28" aria-label="Apply">
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
                <FormShell className="space-y-5" leadKind="careers">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" name="name" required />
                    <Field label="Email" name="email" type="email" required />
                  </div>
                  <ApplyPositionField titles={jobs.map((j) => j.title)} />
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqLd),
        }}
      />
    </>
  );
}
