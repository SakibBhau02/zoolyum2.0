/**
 * Human-friendly layer over the `SiteSetting` key/value table.
 *
 * The database keeps dot-separated keys because the public site reads them by
 * name; the admin never shows a raw key unless it is genuinely unknown.
 */

export type SettingItem = {
  key: string;
  label: string;
  help?: string;
  type: "text" | "long" | "secret";
  suffix?: string;
  value: string;
};

export type SettingGroup = {
  id: string;
  title: string;
  hint?: string;
  items: SettingItem[];
};

type RawItem = Omit<SettingItem, "value">;
type RawGroup = { id: string; title: string; hint?: string; items: RawItem[] };

const PAGE_NAMES: Record<string, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  work: "Work",
  blog: "Insights",
  team: "Team",
  careers: "Careers",
  contact: "Contact",
  process: "Process",
  faq: "FAQ",
  resources: "Resources",
  newsletter: "Newsletter",
  testimonials: "Testimonials",
  "privacy-policy": "Privacy policy",
  "terms-of-service": "Terms of service",
};

const LABELS: Record<string, string> = {
  "brand.tagline": "Brand tagline",
  "header.cta.label": "Header button label",
  "header.cta.href": "Header button link",
  "contact.email": "Public email",
  "contact.phone": "Phone number",
  "contact.address": "Street address",
  "contact.mapUrl": "Google Maps link",
  "contact.hero.lead": "Contact page intro",
  "social.facebook": "Facebook URL",
  "social.instagram": "Instagram URL",
  "social.linkedin": "LinkedIn URL",
  "social.youtube": "YouTube URL",
  "social.x": "X / Twitter URL",
  "seo.google_verification": "Google Search Console token",
  "seo.pinterest_verification": "Pinterest domain token",
  "analytics.ga4_id": "GA4 measurement ID",
  "analytics.gtm_id": "Google Tag Manager ID",
  "analytics.clarity_id": "Microsoft Clarity project ID",
  "analytics.pixel_id": "Meta Pixel ID",
  "analytics.google_ads_id": "Google Ads conversion ID",
  "analytics.google_ads_label": "Google Ads conversion label",
  "analytics.consent_mode": "Consent Mode v2 banner",
  "analytics.server_tracking_enabled": "Server-side tracking enabled",
  "analytics.meta_capi_token": "Meta Conversions API token",
  "analytics.meta_test_event_code": "Meta test event code",
  "analytics.ga4_api_secret": "GA4 Measurement Protocol secret",
  "analytics.indexnow_key": "IndexNow key",
};

const HELP: Record<string, string> = {
  "seo.google_verification": "The content value from the HTML-tag method in Search Console. Empty hides the meta tag.",
  "analytics.ga4_id": "Looks like G-XXXXXXXXXX. Empty disables the direct gtag snippet.",
  "analytics.gtm_id": "When set, GA4 loads through GTM and the direct gtag is skipped to avoid double page views.",
  "analytics.meta_capi_token": "Server-only. Never rendered to the browser.",
  "analytics.ga4_api_secret": "Server-only. Powers GA4 Measurement Protocol events from lead forms.",
  "analytics.indexnow_key": "Used to ping Bing/Yandex the moment a page is published.",
  "analytics.google_ads_id": "Looks like AW-XXXXXXXXX. Ignored when GTM is configured.",
  "analytics.google_ads_label": "Optional conversion label for a specific Google Ads action.",
  "analytics.consent_mode": "Set to 'on' to show the consent banner and deny storage until the visitor chooses.",
  "contact.mapUrl": "The link opened by the Contact card and the footer address.",
};

function titleCase(value: string) {
  return value
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function isSecret(key: string) {
  return /token|secret|password|key$/i.test(key) && !key.endsWith("_id") && key !== "analytics.indexnow_key";
}

function typeFor(key: string, value: string): "text" | "long" | "secret" {
  if (isSecret(key)) return "secret";
  if (value.length > 80 || value.includes("\n")) return "long";
  return "text";
}

/** Split `seo.about.title` into its page + field parts. */
function seoParts(key: string) {
  const parts = key.split(".");
  if (parts[0] !== "seo" || parts.length < 3) return null;
  return { page: parts[1], field: parts.slice(2).join(".") };
}

export function buildGroups(rows: { key: string; value: string }[]): SettingGroup[] {
  const used = new Set<string>();
  const take = (predicate: (k: string) => boolean) =>
    rows
      .filter((r) => predicate(r.key))
      .map((r) => {
        used.add(r.key);
        return r;
      });

  const groups: RawGroup[] = [];

  const SECTION_LABELS: Record<string, string> = {
    hero: "Hero",
    cta: "Call to action",
    footer: "Footer",
    method: "Method",
    results: "Results",
    tagline: "Tagline",
    ticker: "Ticker",
    ui: "Interface labels",
    work: "Selected work",
    news: "Newsletter block",
    seq: "Sequence",
    stats: "Stats",
    faq: "FAQ",
    meta: "Meta",
    intro: "Intro",
    proof: "Proof",
    general: "General",
  };

  /**
   * A long prefix (home has 79 keys) becomes one card per section. Labels are
   * derived from the key, so nothing is hidden behind a raw database name.
   */
  const pushSplit = (list: { key: string; value: string }[], idBase: string, titleBase: string, hint: string) => {
    if (list.length === 0) return;
    const buckets = new Map<string, RawItem[]>();
    for (const row of list) {
      const parts = row.key.split(".");
      const sub = parts.length > 2 ? parts[1] : "general";
      const labelParts = parts.length > 2 ? parts.slice(2) : parts.slice(1);
      if (!buckets.has(sub)) buckets.set(sub, []);
      buckets.get(sub)!.push({
        key: row.key,
        label: titleCase(labelParts.join(" ")),
        help: /title|beat/i.test(row.key) ? "Use | to mark where the accent colour starts and ends." : undefined,
        type: typeFor(row.key, row.value),
      });
    }
    for (const [sub, items] of buckets) {
      groups.push({
        id: `${idBase}-${sub}`,
        title: `${titleBase} · ${SECTION_LABELS[sub] ?? titleCase(sub)}`,
        hint,
        items,
      });
    }
  };

  /* Page metadata — grouped per page so titles and descriptions sit together. */
  const seoRows = take((k) => k.startsWith("seo."));
  const perPage = new Map<string, { key: string; value: string }[]>();
  const seoOther: { key: string; value: string }[] = [];
  for (const row of seoRows) {
    const parsed = seoParts(row.key);
    if (!parsed) {
      seoOther.push(row);
      continue;
    }
    if (!perPage.has(parsed.page)) perPage.set(parsed.page, []);
    perPage.get(parsed.page)!.push(row);
  }
  const order = ["home", "services", "work", "about", "blog", "team", "contact", "process", "faq", "careers", "resources", "newsletter", "testimonials", "privacy-policy", "terms-of-service"];
  const pages = [...perPage.keys()].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  for (const page of pages) {
    groups.push({
      id: `seo-${page}`,
      title: `${PAGE_NAMES[page] ?? titleCase(page)} page`,
      hint: "Shown in Google results and social previews. Keep the title under 60 characters and the description near 155.",
      items: [...perPage.get(page)!]
        .sort((a, b) => {
          const weight = (k: string) => (k.endsWith(".title") ? 0 : k.endsWith(".description") ? 1 : 2);
          return weight(a.key) - weight(b.key) || a.key.localeCompare(b.key);
        })
        .map((row) => {
        const field = seoParts(row.key)?.field ?? "value";
        const isTitle = field === "title";
        return {
          key: row.key,
          label: isTitle ? "Search title" : field === "description" ? "Search description" : titleCase(field),
          help: isTitle ? "Aim for 50–60 characters." : field === "description" ? "Aim for 140–156 characters." : undefined,
          type: typeFor(row.key, row.value),
          suffix: isTitle ? "60" : field === "description" ? "156" : undefined,
        };
      }),
    });
  }
  if (seoOther.length > 0) {
    groups.push({
      id: "seo-other",
      title: "Search verification",
      hint: "Tokens that prove you own the site to search engines.",
      items: seoOther.map((row) => ({
        key: row.key,
        label: LABELS[row.key] ?? titleCase(row.key.split(".").slice(1).join(" ")),
        help: HELP[row.key],
        type: typeFor(row.key, row.value),
      })),
    });
  }

  /* Brand + header */
  const brand = take((k) => k.startsWith("brand.") || k.startsWith("header."));
  if (brand.length > 0) {
    groups.push({
      id: "brand",
      title: "Brand & header",
      hint: "The line under the logo and the header call-to-action.",
      items: brand.map((row) => ({
        key: row.key,
        label: LABELS[row.key] ?? titleCase(row.key.split(".").slice(1).join(" ")),
        help: HELP[row.key],
        type: typeFor(row.key, row.value),
      })),
    });
  }

  /* Homepage copy — split by section so 79 fields never land in one wall. */
  const home = take((k) => k.startsWith("home."));
  pushSplit(home, "home", "Homepage", "Hero beats, section labels and the closing call to action. Saving publishes immediately.");

  /* Work index copy */
  const work = take((k) => k.startsWith("work."));
  pushSplit(work, "work", "Work page", "Section labels, filters and empty states on the case-study index.");

  /* Contact */
  const contact = take((k) => k.startsWith("contact."));
  if (contact.length > 0) {
    groups.push({
      id: "contact",
      title: "Contact details",
      hint: "Powers the contact page, the footer address and Organization schema.",
      items: contact.map((row) => ({
        key: row.key,
        label: LABELS[row.key] ?? titleCase(row.key.split(".").slice(1).join(" ")),
        help: HELP[row.key],
        type: typeFor(row.key, row.value),
      })),
    });
  }

  /* Social */
  const social = take((k) => k.startsWith("social."));
  if (social.length > 0) {
    groups.push({
      id: "social",
      title: "Social profiles",
      hint: "Full URLs only. Empty values remove the icon and the sameAs claim in schema.",
      items: social.map((row) => ({
        key: row.key,
        label: LABELS[row.key] ?? `${titleCase(row.key.split(".")[1] ?? "")} URL`,
        help: "e.g. https://www.linkedin.com/company/zoolyum/",
        type: "text",
      })),
    });
  }

  /* Newsletter */
  const newsletter = take((k) => k.startsWith("newsletter."));
  if (newsletter.length > 0) {
    groups.push({
      id: "newsletter",
      title: "Newsletter page",
      hint: "Copy for the newsletter landing page.",
      items: newsletter.map((row) => ({
        key: row.key,
        label: titleCase(row.key.split(".").slice(1).join(" ")),
        type: typeFor(row.key, row.value),
      })),
    });
  }

  /* Careers + FAQ */
  const careers = take((k) => k.startsWith("careers.") || k.startsWith("hiring.") || k.startsWith("faqs."));
  if (careers.length > 0) {
    groups.push({
      id: "careers",
      title: "Careers & FAQ content",
      hint: "JSON blocks rendered on the careers and FAQ pages.",
      items: careers.map((row) => ({
        key: row.key,
        label: titleCase(row.key.replace(/\./g, " · ")),
        help: "Structured JSON. Edit with care — invalid JSON is rejected on save.",
        type: "long",
      })),
    });
  }

  /* Analytics */
  const analytics = take((k) => k.startsWith("analytics."));
  if (analytics.length > 0) {
    groups.push({
      id: "analytics",
      title: "Analytics & tracking",
      hint: "Public IDs render tags on the site. Tokens stay server-side and never reach the browser.",
      items: analytics.map((row) => ({
        key: row.key,
        label: LABELS[row.key] ?? titleCase(row.key.split(".").slice(1).join(" ")),
        help: HELP[row.key],
        type: typeFor(row.key, row.value),
      })),
    });
  }

  /* Anything unknown, still editable. */
  const rest = rows.filter((r) => !used.has(r.key));
  if (rest.length > 0) {
    groups.push({
      id: "advanced",
      title: "Advanced",
      hint: "Keys without a friendly label. Edit only if you know where they render.",
      items: rest.map((row) => ({
        key: row.key,
        label: row.key,
        type: typeFor(row.key, row.value),
      })),
    });
  }

  const valueByKey = new Map(rows.map((r) => [r.key, r.value]));
  return groups.map((g) => ({
    ...g,
    items: g.items.map((item) => ({ ...item, value: valueByKey.get(item.key) ?? "" })),
  }));
}
