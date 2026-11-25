import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DecorativeChrome } from "@/components/layout/DecorativeChrome";
import { ReadingPause } from "@/components/layout/ReadingPause";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ThreadCursor } from "@/components/ui/ThreadCursor";
import { SoundProvider } from "@/components/layout/SoundProvider";
import { AuditTab } from "@/components/leadgen/AuditTab";
import { AnalyticsLoader } from "@/components/analytics/AnalyticsLoader";
import { ConsentScript } from "@/components/analytics/ConsentScript";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { getMenuLinks, getServices, getContactInfo, getSocials, getSetting, getNewsCopy } from "@/lib/content";
import { ExitIntentModal } from "@/components/leadgen/ExitIntentModal";
import { emailConfigured } from "@/lib/email";

/**
 * Public pages are prerendered and revalidated hourly. Admin saves call
 * revalidatePath for the exact route, so this is only a safety net: it heals a
 * render that happened during a database blip, and picks up edits made by
 * scripts that write to Postgres directly.
 */
export const revalidate = 3600;

/**
 * Site chrome for every public page. Admin routes intentionally live
 * outside this group so the fixed header, cursor, and leadgen widgets
 * never cover the CMS.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [headerLinks, exploreLinks, legalLinks, services, contact, socials, tagline, ctaLabel, ctaHref, news, foot, consentMode] = await Promise.all([
    getMenuLinks("header"),
    getMenuLinks("explore"),
    getMenuLinks("legal"),
    getServices(),
    getContactInfo(),
    getSocials(),
    getSetting("brand.tagline", "Consultancy. Strategy. Solution."),
    getSetting("header.cta.label", "Start a Conversation"),
    getSetting("header.cta.href", "/contact"),
    getNewsCopy(),
    Promise.all([
      getSetting("home.footer.blurb", "The strategic partner that turns market noise into a clear competitive advantage."),
      getSetting("home.footer.newsTitle", "One insight a month"),
      getSetting("home.footer.newsText", "One strategic insight a month. No noise — we dislike noise more than you do."),
      getSetting("home.footer.based", "— Based in Dhaka."),
    ]).then(([blurb, newsTitle, newsText, based]) => ({ blurb, newsTitle, newsText, based })),
    getSetting("analytics.consent_mode", "off"),
  ]);
  const consentOn = consentMode.trim().toLowerCase() === "on";
  const rawCta = ctaHref.trim();
  const ctaTarget = rawCta.startsWith("/") || /^https?:\/\//i.test(rawCta) ? rawCta : "/contact";
  return (
    <SoundProvider>
      {consentOn && <ConsentScript />}
      <SmoothScroll />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-sienna-bright focus:px-4 focus:py-2 focus:font-display focus:font-semibold focus:text-espresso"
      >
        Skip to content
      </a>
      <ReadingPause />
      <DecorativeChrome />
      <ThreadCursor />
      <Header links={headerLinks} ctaLabel={ctaLabel} ctaHref={ctaTarget} tagline={tagline} />
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
      {consentOn && <ConsentBanner />}
      <AuditTab />
      <ExitIntentModal emailConfigured={emailConfigured()} />
    </SoundProvider>
  );
}