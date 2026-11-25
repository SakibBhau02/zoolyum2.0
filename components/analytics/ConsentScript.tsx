/**
 * Consent Mode v2 defaults. Runs inline before GTM/GA4 are injected so the
 * first hit is measured with the correct consent state (advanced mode).
 * Only rendered when the owner turns the consent banner on.
 *
 * It also publishes `window.__zy_consent`, which Meta Pixel and Clarity read:
 * neither understands Google Consent Mode, so they need the boolean directly.
 */
export function ConsentScript() {
  const js = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var stored = null;
try { stored = localStorage.getItem("zy_consent"); } catch (e) {}
var granted = stored === "granted";
window.__zy_consent = granted;
gtag("consent", "default", {
  ad_storage: granted ? "granted" : "denied",
  ad_user_data: granted ? "granted" : "denied",
  ad_personalization: granted ? "granted" : "denied",
  analytics_storage: granted ? "granted" : "denied",
  functionality_storage: "granted",
  security_storage: "granted",
  wait_for_update: 500
});
gtag("set", "ads_data_redaction", !granted);
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
