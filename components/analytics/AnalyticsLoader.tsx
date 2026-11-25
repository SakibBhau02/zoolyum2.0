import { getSetting } from "@/lib/content";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { MicrosoftClarity } from "./MicrosoftClarity";
import { MetaPixel } from "./MetaPixel";
import { GoogleTagManager } from "./GoogleTagManager";
import { ConsentGate } from "./ConsentGate";

/**
 * AnalyticsLoader - reads measurement IDs from settings (admin-editable,
 * no rebuild needed) and renders each tag only when its ID is set.
 * Empty IDs = zero output, zero performance cost.
 *
 * When a GTM container is set, GA4 and Google Ads are configured inside GTM:
 * the direct gtag loader is skipped to avoid double page views.
 */
export async function AnalyticsLoader() {
  const [ga4, clarity, pixel, gtm, ads, adsLabel, consentMode] = await Promise.all([
    getSetting("analytics.ga4_id", ""),
    getSetting("analytics.clarity_id", ""),
    getSetting("analytics.pixel_id", ""),
    getSetting("analytics.gtm_id", ""),
    getSetting("analytics.google_ads_id", ""),
    getSetting("analytics.google_ads_label", ""),
    getSetting("analytics.consent_mode", "off"),
  ]);
  const requireConsent = consentMode.trim().toLowerCase() === "on";
  const gtmId = gtm.trim();
  const ga4Id = ga4.trim();
  const clarityId = clarity.trim();
  const pixelId = pixel.trim();
  const adsId = ads.trim();

  return (
    <>
      {gtmId !== "" && (
        <ConsentGate requireConsent={requireConsent}>
          <GoogleTagManager id={gtmId} />
        </ConsentGate>
      )}
      {gtmId === "" && (ga4Id !== "" || adsId !== "") && (
        <ConsentGate requireConsent={requireConsent}>
          <GoogleAnalytics id={ga4Id} adsId={adsId || undefined} adsLabel={adsLabel.trim() || undefined} />
        </ConsentGate>
      )}
      {clarityId !== "" && (
        <ConsentGate requireConsent={requireConsent}>
          <MicrosoftClarity id={clarityId} />
        </ConsentGate>
      )}
      {pixelId !== "" && (
        <ConsentGate requireConsent={requireConsent}>
          <MetaPixel id={pixelId} />
        </ConsentGate>
      )}
    </>
  );
}
