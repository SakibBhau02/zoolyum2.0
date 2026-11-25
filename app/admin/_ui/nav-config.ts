import type { IconName } from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  badgeKey?: "leads";
  exact?: boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

export const CONTENT_ITEMS: NavItem[] = [
  { href: "/admin/posts", label: "Blog posts", icon: "file" },
  { href: "/admin/projects", label: "Case studies", icon: "briefcase" },
  { href: "/admin/services", label: "Services", icon: "layers" },
  { href: "/admin/team", label: "Team", icon: "users" },
  { href: "/admin/jobs", label: "Jobs", icon: "briefcase" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "quote" },
  { href: "/admin/menulinks", label: "Navigation", icon: "link" },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
      { href: "/admin/seo", label: "SEO & AEO", icon: "seo" },
      { href: "/admin/seo/health", label: "Site health", icon: "globe" },
      { href: "/admin/seo/bulk", label: "Bulk snippets", icon: "edit" },
      { href: "/admin/seo/search", label: "Search performance", icon: "search" },
      { href: "/admin/tracking", label: "Tracking", icon: "activity" },
      { href: "/admin/leads", label: "Leads", icon: "inbox", badgeKey: "leads" },
      { href: "/admin/media", label: "Media", icon: "image" },
    ],
  },
  { label: "Content", items: CONTENT_ITEMS },
  {
    label: "Site",
    items: [
      { href: "/admin/home", label: "Homepage", icon: "home" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
      { href: "/admin/users", label: "Team & access", icon: "shield" },
      { href: "/admin/audit", label: "Activity log", icon: "history" },
    ],
  },
];

export const QUICK_CREATE: { label: string; href: string; icon: IconName }[] = [
  { label: "New blog post", href: "/admin/posts/new", icon: "file" },
  { label: "New case study", href: "/admin/projects/new", icon: "briefcase" },
  { label: "New service", href: "/admin/services/new", icon: "layers" },
  { label: "New job", href: "/admin/jobs/new", icon: "briefcase" },
  { label: "Open SEO workspace", href: "/admin/seo", icon: "seo" },
  { label: "Open lead inbox", href: "/admin/leads", icon: "inbox" },
];
