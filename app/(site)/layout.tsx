import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TerrainScrollIndicator } from "@/components/layout/TerrainScrollIndicator";
import { ReadingPause } from "@/components/layout/ReadingPause";
import { ThreadCursor } from "@/components/ui/ThreadCursor";
import { AmbientParticles } from "@/components/ui/AmbientParticles";
import { SignalFlash } from "@/components/ui/SignalFlash";
import { SoundProvider } from "@/components/layout/SoundProvider";
import { AuditTab } from "@/components/leadgen/AuditTab";
import { AnalyticsLoader } from "@/components/analytics/AnalyticsLoader";
import { getMenuLinks, getServices, getContactInfo, getSocials, getSetting, getNewsCopy } from "@/lib/content";
import { ExitIntentModal } from "@/components/leadgen/ExitIntentModal";

/**
 * Site chrome for every public page. Admin routes intentionally live
 * outside this group so the fixed header, cursor, and leadgen widgets
 * never cover the CMS.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [headerLinks, exploreLinks, legalLinks, services, contact, socials, tagline, ctaLabel, news, foot] = await Promise.all([
    getMenuLinks("header"),
    getMenuLinks("explore"),
    getMenuLinks("legal"),
    getServices(),
    getContactInfo(),
    getSocials(),
    getSetting("brand.tagline", "Consultancy. Strategy. Solution."),
    getSetting("header.cta.label", "Start a Conversation"),
    getNewsCopy(),
    Promise.all([
      getSetting("home.footer.blurb", "The strategic partner that turns market noise into a clear competitive advantage."),
      getSetting("home.footer.newsTitle", "One insight a month"),
      getSetting("home.footer.newsText", "One strategic insight a month. No noise — we dislike noise more than you do."),
      getSetting("home.footer.based", "— Based in Dhaka."),
    ]).then(([blurb, newsTitle, newsText, based]) => ({ blurb, newsTitle, newsText, based })),
  ]);
  return (
    <SoundProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-sienna-bright focus:px-4 focus:py-2 focus:font-display focus:font-semibold focus:text-espresso"
      >
        Skip to content
      </a>
      <ReadingPause />
      <AmbientParticles />
      <ThreadCursor />
      <TerrainScrollIndicator />
      <Header links={headerLinks} ctaLabel={ctaLabel} tagline={tagline} />
      <main id="main">{children}</main>
      <Footer
        explore={exploreLinks}
        legal={legalLinks}
        services={services.map((s) => ({ name: s.name, slug: s.slug }))}
        contact={contact}
        socials={socials}
        tagline={tagline}
        news={news}
        foot={foot}
      />
      <AnalyticsLoader />
      <AuditTab />
      <ExitIntentModal />
      <SignalFlash />
    </SoundProvider>
  );
}