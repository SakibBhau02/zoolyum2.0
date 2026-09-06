import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./form";

const GROUPS: { title: string; prefix: string; hint?: string }[] = [
  { title: "SEO titles & descriptions", prefix: "seo." },
  { title: "Contact info", prefix: "contact.", hint: "Address + map URL power the Contact page card and the footer address link." },
  { title: "Social links & brand", prefix: "social.", hint: "Full URLs, e.g. https://facebook.com/yourpage — empty keeps the icon fallback." },
  { title: "Brand & header", prefix: "brand." },
  { title: "Header", prefix: "header." },
  { title: "Homepage", prefix: "home." },
  {
    title: "Analytics, pixels & server tracking",
    prefix: "analytics.",
    hint: "Public IDs render tags on the site. Tokens/secrets stay server-only and never ship to the browser — they power Meta CAPI + GA4 Measurement Protocol from createLead.",
  },
];

export default async function SettingsPage() {
  const all = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } }).catch(() => []);
  const grouped = GROUPS.map((g) => ({
    ...g,
    items: all.filter((s) => s.key.startsWith(g.prefix)),
  }));
  const rest = all.filter((s) => !GROUPS.some((g) => s.key.startsWith(g.prefix)));
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Studio</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ivory">Site settings<span className="text-sienna">.</span></h1>
      <p className="body-copy mt-3 max-w-xl font-body text-sm text-ivory/50">
        Every page title, description, and the contact block - saved here, live everywhere.
      </p>
      <div className="mt-8">
        <SettingsForm grouped={grouped} rest={rest} />
      </div>
    </div>
  );
}