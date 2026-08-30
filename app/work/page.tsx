import type { Metadata } from "next";
import { PageHero } from "@/components/pages/PageHero";
import { WorkGallery } from "@/components/pages/WorkGallery";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies as positions held — brands we've strengthened across education, real estate, F&B, and e-commerce in Bangladesh.",
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Selected Work"
        title={
          <>
            Ground our clients <span className="accent-word">hold.</span>
          </>
        }
        lead="Every engagement is judged the same way: did the position strengthen, and can we prove it. Filter by industry or service — the numbers are precise on purpose."
      />
      <section className="relative overflow-hidden pb-24 md:pb-32" aria-label="Work gallery">
        <div className="section-shell">
          <WorkGallery />
        </div>
      </section>
    </>
  );
}
