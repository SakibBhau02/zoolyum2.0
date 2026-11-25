import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getTrackingConfig } from "@/lib/tracking";
import { Badge, Card, CardHeader, EmptyState, Notice, PageHeader } from "../_ui/primitives";
import { Icon } from "../_ui/icons";
import { relativeTime } from "../_ui/format";
import { TrackingForm, TestEventButton, type TrackingField } from "./tracking-client";

const FIELD_DEFS: Omit<TrackingField, "value">[] = [
  { key: "analytics.gtm_id", label: "Google Tag Manager container", help: "GTM-XXXXXXX. When set, GA4 and Ads are configured inside GTM." },
  { key: "analytics.ga4_id", label: "GA4 measurement ID", help: "G-XXXXXXXXXX. Ignored when a GTM container is set." },
  { key: "analytics.ga4_api_secret", label: "GA4 Measurement Protocol secret", help: "Server-only. Enables server-side generate_lead.", secret: true },
  { key: "analytics.google_ads_id", label: "Google Ads conversion ID", help: "AW-XXXXXXXXX. Loaded only when GTM is not set." },
  { key: "analytics.google_ads_label", label: "Google Ads conversion label", help: "Optional label for a specific conversion action." },
  { key: "analytics.clarity_id", label: "Microsoft Clarity project", help: "Project ID from clarity.microsoft.com." },
  { key: "analytics.pixel_id", label: "Meta Pixel ID", help: "Numeric. Enables the browser Pixel." },
  { key: "analytics.meta_capi_token", label: "Meta Conversions API token", help: "Server-only. Enables CAPI with the shared event_id.", secret: true },
  { key: "analytics.meta_test_event_code", label: "Meta test event code", help: "Optional; routes events to Events Manager → Test Events." },
  { key: "analytics.server_tracking_enabled", label: "Server tracking", help: "'true' or 'false'. Pauses CAPI/MP without deleting tokens." },
  { key: "analytics.consent_mode", label: "Consent Mode v2 banner", help: "'on' shows a consent banner and sets denied-by-default until accepted." },
  { key: "analytics.indexnow_key", label: "IndexNow key", help: "Powers instant indexing pings on publish." },
];

const EVENT_MAP = [
  { event: "page_view", where: "GTM dataLayer / gtag", when: "Every App Router navigation (landing page comes from the tag itself)" },
  { event: "lead", where: "GTM dataLayer", when: "Form success (browser)" },
  { event: "generate_lead", where: "GA4 gtag", when: "Form success (browser, no GTM)" },
  { event: "conversion", where: "Google Ads gtag", when: "Form success, when an Ads label is set and GTM is not used" },
  { event: "Lead", where: "Meta Pixel", when: "Form success with shared eventID" },
  { event: "Lead", where: "Meta CAPI", when: "Server, deduped by event_id" },
  { event: "generate_lead", where: "GA4 Measurement Protocol", when: "Server, joined by client_id" },
  { event: "consent_update", where: "GTM dataLayer + Meta consent", when: "Consent banner choice" },
];

/**
 * What each platform still needs in its own dashboard — the part no code
 * change can do. `done` is derived from what is configured here.
 */
function platformChecklist(config: { gtmId: string; ga4Id: string; ga4ApiSecret: string; googleAdsId: string; googleAdsLabel: string; pixelId: string; metaCapiToken: string; metaTestEventCode: string; clarityId: string; consentMode: boolean }) {
  const ga = config.gtmId ? "GTM" : "gtag";
  return [
    {
      platform: "GA4",
      done: Boolean(config.ga4Id || config.gtmId),
      steps: [
        `Property exists and the measurement ID is set (${ga})`,
        "Mark generate_lead as a key event in GA4 → Admin → Key events",
        config.ga4ApiSecret ? "Measurement Protocol secret saved ✓" : "Add a Measurement Protocol secret for server-side leads",
      ],
    },
    {
      platform: "Google Ads",
      done: Boolean(config.googleAdsId && config.googleAdsLabel) || Boolean(config.gtmId),
      steps: [
        config.googleAdsId ? `Conversion ID saved (${config.googleAdsId}) ✓` : "Add the AW- conversion ID",
        config.googleAdsLabel ? "Conversion label saved ✓" : "Add the conversion label for the lead action",
        config.gtmId ? "Conversion fires from GTM" : "Fires from the browser on form success",
      ],
    },
    {
      platform: "Meta",
      done: Boolean(config.pixelId),
      steps: [
        config.pixelId ? "Pixel ID saved ✓" : "Add the numeric Pixel ID",
        config.metaCapiToken ? "Conversions API token saved ✓" : "Add a CAPI token so server events survive ad blockers",
        "Verify the domain in Business Manager → Brand safety → Domains",
        config.metaTestEventCode ? "Test event code active — remember to clear it" : "Optional: add a test event code while validating",
      ],
    },
    {
      platform: "GTM",
      done: Boolean(config.gtmId),
      steps: [
        config.gtmId ? "Container ID saved ✓" : "Optional — only needed if you want tag management",
        "Disable the built-in Page View trigger; the site pushes page_view itself",
      ],
    },
    {
      platform: "Clarity",
      done: Boolean(config.clarityId),
      steps: [
        config.clarityId ? "Project ID saved ✓" : "Add the Clarity project ID",
        "Loads only after consent when the banner is on",
      ],
    },
    {
      platform: "Consent",
      done: config.consentMode,
      steps: [
        config.consentMode ? "Banner on: denied by default until accepted ✓" : "Turn on for EEA/UK traffic",
        "Clarity and Meta are gated on the same choice",
      ],
    },
  ];
}

export default async function TrackingPage() {
  await requireUser("editor");
  const [config, settings, recent, totals, errors] = await Promise.all([
    getTrackingConfig(),
    prisma.siteSetting.findMany({ where: { key: { in: FIELD_DEFS.map((f) => f.key) } }, select: { key: true, value: true } }).catch(() => []),
    prisma.trackingEvent.findMany({ orderBy: { createdAt: "desc" }, take: 15 }).catch(() => []),
    prisma.trackingEvent.count().catch(() => 0),
    prisma.trackingEvent.count({ where: { status: "error" } }).catch(() => 0),
  ]);
  const values = new Map(settings.map((s) => [s.key, s.value]));
  const fields: TrackingField[] = FIELD_DEFS.map((field) => ({ ...field, value: values.get(field.key) ?? "" }));

  const integrations = [
    { name: "Google Tag Manager", ok: Boolean(config.gtmId), detail: config.gtmId || "Not configured" },
    { name: "GA4", ok: Boolean(config.ga4Id), detail: config.gtmId ? "Loaded through GTM" : config.ga4Id || "Not configured" },
    { name: "GA4 Measurement Protocol", ok: Boolean(config.ga4Id && config.ga4ApiSecret), detail: config.ga4ApiSecret ? "Secret present" : "Secret missing" },
    { name: "Google Ads", ok: Boolean(config.googleAdsId), detail: config.googleAdsId || "Not configured" },
    { name: "Microsoft Clarity", ok: Boolean(config.clarityId), detail: config.clarityId || "Not configured" },
    { name: "Meta Pixel", ok: Boolean(config.pixelId), detail: config.pixelId || "Not configured" },
    { name: "Meta CAPI", ok: Boolean(config.pixelId && config.metaCapiToken), detail: config.metaCapiToken ? "Token present" : "Token missing" },
    { name: "Server tracking", ok: config.serverEnabled, detail: config.serverEnabled ? "Enabled" : "Paused" },
    { name: "Consent Mode v2", ok: config.consentMode, detail: config.consentMode ? "Banner on" : "Banner off" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title={
          <>
            Tracking<span className="text-[var(--a-accent)]">.</span>
          </>
        }
        description="What is wired, what is missing, and proof that server-side events actually leave the building."
        actions={
          <Link href="/admin/seo" className="a-btn">
            SEO &amp; AEO
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="a-card p-4">
          <p className="a-faint text-[10.5px] font-semibold uppercase tracking-[0.14em]">Events logged</p>
          <p className="a-title mt-2 text-[26px] tabular-nums">{totals}</p>
        </div>
        <div className="a-card p-4">
          <p className="a-faint text-[10.5px] font-semibold uppercase tracking-[0.14em]">Errors</p>
          <p className={`a-title mt-2 text-[26px] tabular-nums ${errors > 0 ? "text-[var(--a-bad)]" : ""}`}>{errors}</p>
        </div>
        <div className="a-card p-4">
          <p className="a-faint text-[10.5px] font-semibold uppercase tracking-[0.14em]">Configured</p>
          <p className="a-title mt-2 text-[26px] tabular-nums">
            {integrations.filter((i) => i.ok).length}/{integrations.length}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Integration status" hint="Green means an ID (and secret, where required) is present." />
          <ul className="space-y-1">
            {integrations.map((item) => (
              <li key={item.name} className="flex items-center gap-3 rounded-[8px] px-2 py-2 text-[12.5px]">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.ok ? "bg-[var(--a-ok)]" : "bg-[var(--a-faint)]"}`}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.name}</span>
                <span className="a-faint max-w-[180px] truncate text-[10.5px]" title={item.detail}>
                  {item.detail}
                </span>
                <Badge tone={item.ok ? "ok" : "neutral"}>{item.ok ? "on" : "off"}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Send a test event" hint="Fires a real server event and logs the result below." />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12.5px]">Meta Conversions API</span>
              <TestEventButton provider="meta" label="Test Meta CAPI" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12.5px]">GA4 Measurement Protocol</span>
              <TestEventButton provider="ga4" label="Test GA4 MP" />
            </div>
          </div>
          {!config.serverEnabled && (
            <div className="mt-3">
              <Notice tone="warn">Server tracking is paused. Turn it on below before testing.</Notice>
            </div>
          )}
          <p className="a-faint mt-3 text-[11px] leading-relaxed">
            A test needs the public ID <em>and</em> the matching secret. Results are written to the event log with kind
            &ldquo;test&rdquo;.
          </p>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Integration settings" hint="Saved to the database; no redeploy needed." />
        <TrackingForm fields={fields} />
      </Card>

      <Card className="mt-4">
        <CardHeader
          title="What each platform still needs"
          hint="The dashboard-side steps no code change can do. Green means the ID is saved here."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {platformChecklist(config).map((item) => (
            <div key={item.platform} className="rounded-[9px] border border-[var(--a-line)] p-3.5">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${item.done ? "bg-[var(--a-ok)]" : "bg-[var(--a-faint)]"}`} aria-hidden="true" />
                <span className="text-[12.5px] font-medium">{item.platform}</span>
                <Badge tone={item.done ? "ok" : "neutral"}>{item.done ? "ready" : "setup"}</Badge>
              </div>
              <ul className="mt-2 space-y-1">
                {item.steps.map((step) => (
                  <li key={step} className="a-faint flex gap-1.5 text-[11px] leading-relaxed">
                    <span aria-hidden="true">·</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4" padded={false}>
        <div className="flex items-center justify-between border-b border-[var(--a-line)] px-5 py-3.5">
          <div>
            <h2 className="a-title text-[15px]">Server event log</h2>
            <p className="a-faint mt-0.5 text-[11px]">Newest first · Meta CAPI + GA4 Measurement Protocol</p>
          </div>
          <Icon name="history" className="h-4 w-4 text-[var(--a-faint)]" />
        </div>
        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No server events yet"
              description="Submit a form on the site, or use the test buttons above, and every attempt will appear here."
            />
          </div>
        ) : (
          <div className="a-scroll overflow-x-auto">
            <table className="a-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Provider</th>
                  <th>Event</th>
                  <th>Kind</th>
                  <th>Status</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td className="a-faint whitespace-nowrap text-[11px]">{relativeTime(row.createdAt)}</td>
                    <td className="text-[12px]">{row.provider}</td>
                    <td className="a-mono text-[11px]">{row.eventName}</td>
                    <td className="a-faint text-[11px]">{row.kind}</td>
                    <td>
                      <Badge tone={row.status === "ok" ? "ok" : row.status === "error" ? "bad" : "neutral"}>{row.status}</Badge>
                    </td>
                    <td className="max-w-[320px]">
                      <span className="a-faint block truncate text-[10.5px]" title={row.detail ?? ""}>
                        {row.detail ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-4" padded={false}>
        <div className="border-b border-[var(--a-line)] px-5 py-3.5">
          <h2 className="a-title text-[15px]">Event map</h2>
          <p className="a-faint mt-0.5 text-[11px]">Where each event comes from, so GTM triggers can be named to match.</p>
        </div>
        <div className="a-scroll overflow-x-auto">
          <table className="a-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Source</th>
                <th>Fires when</th>
              </tr>
            </thead>
            <tbody>
              {EVENT_MAP.map((row) => (
                <tr key={`${row.event}-${row.where}`}>
                  <td className="a-mono text-[11px]">{row.event}</td>
                  <td className="text-[12px]">{row.where}</td>
                  <td className="a-faint text-[11.5px]">{row.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
