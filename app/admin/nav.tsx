"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLLECTIONS, COLLECTION_KEYS } from "./config";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  dashboard: "M3 3h7v7H3zM10 3h7v4h-7zM10 9h7v8h-7zM3 12h7v5H3z",
  posts: "M4 5h12M4 10h12M4 15h7",
  projects: "M3 7h14v9H3zM7 4h6v3H7z",
  services: "M4 4l6 3-6 3zM10 10l6 3-6 3zM4 4v12",
  team: "M7 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 17c0-2.5 1.8-4 4-4s4 1.5 4 4M14 5.5h3M15.5 4v3M17 13c-1 0-2 .5-2.5 1.5",
  jobs: "M3 5h14v8l-3 4H6l-3-4zM7 5v8M13 5v8",
  testimonials: "M4 5h12v7H9l-3 3v-3H4z",
  settings: "M10 7a3 3 0 100 6 3 3 0 000-6zM10 3v2M10 15v2M3 10h2M15 10h2M5.5 5.5l1.4 1.4M13.1 13.1l1.4 1.4M14.5 5.5l-1.4 1.4M6.9 13.1l-1.4 1.4",
  leads: "M3 5h14v10H3zM3 6l7 5 7-5",
  media: "M4 5h12v10H4zM4 13l3.5-3.5L10 12l2.5-2.5L16 13M13 8h.01",
};

export function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  const item = (href: string, label: string, icon: string, badge?: number) => {
    const active = href === "/admin" ? path === href : path === href || path.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm transition-all duration-200 ${active ? "bg-sienna/15 text-sienna-bright shadow-[inset_2px_0_0_#ff5001]" : "text-ivory/60 hover:bg-umber/70 hover:text-ivory"}`}
      >
        <Icon d={ICONS[icon] ?? ICONS.dashboard} />
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="rounded-full bg-sienna px-2 py-0.5 font-display text-[10px] font-bold text-espresso">{badge}</span>
        )}
      </Link>
    );
  };
  return (
    <nav className="flex gap-1.5 overflow-x-auto md:flex-col" aria-label="Admin">
      {item("/admin", "Dashboard", "dashboard")}
      <p className="hidden px-3.5 pt-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/30 md:block">Content</p>
      {COLLECTION_KEYS.map((k) => item(`/admin/${k}`, COLLECTIONS[k].label, k))}
      <p className="hidden px-3.5 pt-4 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/30 md:block">Studio</p>
      {item("/admin/settings", "Site settings", "settings")}
      {item("/admin/leads", "Leads", "leads", unread)}
      {item("/admin/media", "Media", "media")}
    </nav>
  );
}
