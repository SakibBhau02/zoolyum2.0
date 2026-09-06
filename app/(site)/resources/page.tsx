import type { Metadata } from "next";
import { pageMeta } from "@/lib/content";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ResourceGate } from "@/components/pages/ResourceGate";
import { RESOURCES } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("resources", {
    title: "Resources",
    description: "Free tools from the Zoolyum toolkit — brand audit checklist, content calendar template, and campaign brief one-pager.",
    canonical: "/resources",
    ogTitle: "Resources | Zoolyum",
    ogDescription: "Free tools from the Zoolyum toolkit - brand audit checklist, content calendar template, and campaign brief one-pager.",
    card: "summary",
  });
}

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources — The Toolkit"
        title={
          <>
            Tools we&apos;re <span className="accent-word">giving away.</span>
          </>
        }
        lead="The exact documents our strategists use on paid engagements. Free, because a market full of sharper brands is a better market for everyone."
      />

      <section className="relative overflow-hidden pb-24 pt-12 md:pb-32 md:pt-16" aria-label="Resources">
        <div className="section-shell grid gap-6 md:grid-cols-3">
          {RESOURCES.map((resource, i) => (
            <Reveal key={resource.title} delay={i * 90}>
              <ResourceGate
                title={resource.title}
                description={resource.description}
                format={resource.format}
                slug={resource.slug}
              />
            </Reveal>
          ))}
        </div>

        <div className="section-shell mt-20">
          <Reveal>
            <p className="mx-auto max-w-xl text-center font-accent text-xl italic leading-relaxed text-ivory/55">
              &ldquo;Free tools are how the market knows you&apos;re serious.&rdquo;
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
