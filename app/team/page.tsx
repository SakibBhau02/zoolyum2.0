import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { TEAM } from "@/lib/data";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The people behind the pattern-reading — strategists, designers, engineers, and filmmakers at Zoolyum.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team | Zoolyum",
    description: "The people behind the pattern-reading - strategists, designers, engineers, and filmmakers at Zoolyum.",
    url: "/team",
  },
  twitter: {
    card: "summary",
    title: "Team | Zoolyum",
    description: "The people behind the pattern-reading - strategists, designers, engineers, and filmmakers at Zoolyum.",
  },
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="The Team"
        title={
          <>
            Small on purpose. <span className="accent-word">Senior by design.</span>
          </>
        }
        lead="Eight people, one method. We've killed projects we believed in because the strategy demanded better — that's the standard."
      />

      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Team members">
        <div className="section-shell grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member, i) => (
            <Reveal key={member.name} delay={(i % 4) * 80}>
              <div className="card-surface group relative h-full p-7">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rotate-45 bg-gradient-to-b from-sienna/15 to-transparent opacity-0 transition-all duration-500 group-hover:-right-4 group-hover:opacity-100"
                />
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-espresso font-display text-2xl font-semibold text-ivory/50 ring-1 ring-olive/30 transition-all duration-500 group-hover:bg-sienna group-hover:text-espresso group-hover:ring-sienna/50">
                  {member.initials}
                </div>
                <h2 className="mt-6 font-display text-xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
                  {member.name}
                </h2>
                <p className="mt-1.5 font-body text-[13px] font-medium tracking-wide text-sienna/80">
                  {member.role}
                </p>
                <p className="body-copy mt-4 border-t border-olive/20 pt-4 font-body text-sm leading-relaxed text-ivory/55">
                  {member.expertise}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="section-shell mt-20">
          <Reveal>
            <div className="card-surface flex flex-col items-start justify-between gap-6 p-9 md:flex-row md:items-center md:p-12">
              <div>
                <h2 className="font-display text-display-3 font-semibold text-ivory">
                  The market needs another reader.
                </h2>
                <p className="body-copy mt-3 font-body text-[15px] leading-relaxed text-ivory/60">
                  We hire for judgment first, skills second. If your work
                  makes rooms go quiet, we should talk.
                </p>
              </div>
              <Link href="/careers" className="btn btn-primary shrink-0">
                See open roles
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
