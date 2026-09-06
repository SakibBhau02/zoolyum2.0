import { getSetting } from "@/lib/content";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { MicrosoftClarity } from "./MicrosoftClarity";
import { MetaPixel } from "./MetaPixel";
import { GoogleTagManager } from "./GoogleTagManager";

/**
 * AnalyticsLoader - reads measurement IDs from settings (admin-editable,
 * no rebuild needed) and renders each tag only when its ID is set.
 * Empty IDs = zero output, zero performance cost.
 * When a GTM container is set, GA4 loads through GTM (direct gtag is
 * skipped to avoid double PageViews); server CAPI/MP run from createLead.
 */
export async function AnalyticsLoader() {
  const [ga4, clarity, pixel, gtm] = await Promise.all([
    getSetting("analytics.ga4_id", ""),
    getSetting("analytics.clarity_id", ""),
    getSetting("analytics.pixel_id", ""),
    getSetting("analytics.gtm_id", ""),
  ]);
  const gtmId = gtm.trim();
  const ga4Id = ga4.trim();
  return (
    <>
      {gtmId !== "" && <GoogleTagManager id={gtmId} />}
      {gtmId === "" && ga4Id !== "" && <GoogleAnalytics id={ga4Id} />}
      {clarity.trim() !== "" && <MicrosoftClarity id={clarity.trim()} />}
      {pixel.trim() !== "" && <MetaPixel id={pixel.trim()} />}
    </>
  );
}
