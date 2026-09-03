import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import { SITE_URL } from "@/lib/data";
import { PageHero } from "@/components/pages/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("privacy-policy", {
    title: "Privacy Policy",
    description: "How Zoolyum collects, uses, and protects your information.",
    canonical: "/privacy-policy",
    ogTitle: "Privacy Policy | Zoolyum",
    ogDescription: "How Zoolyum collects, uses, and protects your information.",
    card: "summary",
  });
}

const SECTIONS = [
  { title: "1. What we collect", body: "When you contact us through our forms, we collect the information you provide directly: your name, email address, phone number, company details, and the content of your message. When you subscribe to our newsletter, we collect your email address. We also collect standard technical data (browser type, device, pages visited) through privacy-respecting analytics that do not identify individual users." },
  { title: "2. How we use it", body: "We use your information to respond to enquiries, prepare proposals, deliver services you have engaged us for, send the newsletter you opted into, and improve our website. We do not sell, rent, or trade your personal information to third parties. Ever." },
  { title: "3. Data retention", body: "Enquiry and project communication is retained for as long as needed to serve you and to meet legal or accounting obligations. Newsletter data is retained until you unsubscribe, which you can do from any email we send." },
  { title: "4. Cookies", body: "This site uses minimal cookies required for functionality and anonymous analytics. We do not use advertising cookies or third-party trackers that build behavioral profiles." },
  { title: "5. Your rights", body: "You may request access to, correction of, or deletion of your personal data at any time by writing to hello@zoolyum.com. We respond to all requests within 30 days, in line with applicable data protection regulations." },
  { title: "6. Changes to this policy", body: "If we update this policy, the revised version will be posted on this page with a new effective date. Material changes will be announced through our usual channels." },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lead="Effective date: January 2026. The short version: your data stays with us — we never sell it."
      />
      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Privacy policy content">
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
