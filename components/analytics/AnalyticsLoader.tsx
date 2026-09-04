import { getSetting } from "@/lib/content";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { MicrosoftClarity } from "./MicrosoftClarity";
import { MetaPixel } from "./MetaPixel";

/**
 * AnalyticsLoader - reads measurement IDs from settings (admin-editable,
 * no rebuild needed) and renders each tag only when its ID is set.
 * Empty IDs = zero output, zero performance cost.
 */
export async function AnalyticsLoader() {
  const [ga4, clarity, pixel] = await Promise.all([
    getSetting("analytics.ga4_id", ""),
    getSetting("analytics.clarity_id", ""),
    getSetting("analytics.pixel_id", ""),
  ]);
  return (
    <>
      {ga4.trim() !== "" && <GoogleAnalytics id={ga4.trim()} />}
      {clarity.trim() !== "" && <MicrosoftClarity id={clarity.trim()} />}
      {pixel.trim() !== "" && <MetaPixel id={pixel.trim()} />}
    </>
  );
}
