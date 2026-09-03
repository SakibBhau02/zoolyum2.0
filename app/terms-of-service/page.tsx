import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern engagement with Zoolyum and use of this website.",
  alternates: { canonical: "/terms-of-service" },
  openGraph: {
    title: "Terms of Service | Zoolyum",
    description: "The terms that govern engagement with Zoolyum and use of this website.",
    url: "/terms-of-service",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Zoolyum",
    description: "The terms that govern engagement with Zoolyum and use of this website.",
  },
};

const SECTIONS = [
  { title: "1. The website", body: "Content on this website — including case study metrics, articles, and downloadable resources — is provided for general information. Metrics cited in case studies reflect specific engagements and are not guarantees of comparable results for your brand." },
  { title: "2. Intellectual property", body: "All original work on this site (text, design, code, and downloadable tools) belongs to Zoolyum unless otherwise credited. Downloadable resources may be used freely within your organization but may not be resold or republished without written permission." },
  { title: "3. Engagements", body: "Client engagements are governed by individual service agreements that take precedence over anything stated on this website. Proposals, timelines, and pricing shared in conversation are indicative until confirmed in a signed agreement." },
  { title: "4. Client responsibilities", body: "Effective work requires honest inputs: access to decision makers, timely feedback, and accurate business information. Delays in these areas may affect timelines and outcomes." },
  { title: "5. Liability", body: "To the maximum extent permitted by law, Zoolyum is not liable for indirect or consequential losses arising from use of this website or its downloadable resources. Our liability for client engagements is defined in the applicable service agreement." },
  { title: "6. Governing law", body: "These terms are governed by the laws of Bangladesh. Disputes will be resolved in the courts of Dhaka, Bangladesh, unless otherwise agreed in a signed service agreement." },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        lead="Effective date: January 2026. Fair terms for fair work."
      />
      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Terms of service content">
        <div className="section-shell max-w-3xl space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-xl font-semibold text-ivory">
                {section.title}
              </h2>
              <p className="body-copy mt-4 font-body text-[15px] leading-[1.85] text-ivory/60">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
