/**
 * One source of truth for the public route list.
 *
 * The SEO workspace, the health audit and the sitemap all need the same set of
 * marketing routes; keeping it here stops them drifting apart.
 */

export type StaticRoute = {
  path: string;
  label: string;
  group: "Static" | "Legal";
  /** Which structured-data nodes the page template emits. */
  schema: string[];
};

export const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", label: "Home", group: "Static", schema: ["WebSite", "Organization"] },
  { path: "/services", label: "Services index", group: "Static", schema: ["CollectionPage", "ItemList"] },
  { path: "/work", label: "Work index", group: "Static", schema: ["CollectionPage", "ItemList"] },
  { path: "/about", label: "About", group: "Static", schema: ["AboutPage", "BreadcrumbList"] },
  { path: "/blog", label: "Insights index", group: "Static", schema: ["Blog", "CollectionPage"] },
  { path: "/team", label: "Team", group: "Static", schema: ["CollectionPage", "BreadcrumbList"] },
  { path: "/contact", label: "Contact", group: "Static", schema: ["ContactPage", "FAQPage"] },
  { path: "/process", label: "Process", group: "Static", schema: ["WebPage", "BreadcrumbList"] },
  { path: "/faq", label: "FAQ", group: "Static", schema: ["FAQPage", "BreadcrumbList"] },
  { path: "/careers", label: "Careers", group: "Static", schema: ["JobPosting", "FAQPage"] },
  { path: "/resources", label: "Resources", group: "Static", schema: ["CollectionPage", "BreadcrumbList"] },
  { path: "/newsletter", label: "Newsletter", group: "Static", schema: ["CollectionPage", "FAQPage"] },
  { path: "/testimonials", label: "Testimonials", group: "Static", schema: ["CollectionPage", "Review"] },
  { path: "/privacy-policy", label: "Privacy policy", group: "Legal", schema: ["WebPage"] },
  { path: "/terms-of-service", label: "Terms of service", group: "Legal", schema: ["WebPage"] },
];

/** Title + description length bands used by the editor and the audit. */
export const TITLE_RANGE = { min: 30, max: 60 } as const;
export const DESC_RANGE = { min: 110, max: 160 } as const;

export function titleState(len: number): "ok" | "warn" | "bad" {
  if (len === 0) return "bad";
  if (len < TITLE_RANGE.min || len > TITLE_RANGE.max) return "warn";
  return "ok";
}

export function descState(len: number): "ok" | "warn" | "bad" {
  if (len === 0) return "bad";
  if (len < DESC_RANGE.min || len > DESC_RANGE.max) return "warn";
  return "ok";
}
