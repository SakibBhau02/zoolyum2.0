import { getServices, getProjects, getPosts, getContactInfo } from "@/lib/content";
import { SITE_URL } from "@/lib/data";

export const revalidate = 3600;

/**
 * /llms.txt — a Markdown map of the site for AI answer engines.
 *
 * Generated from the CMS so new services and posts appear without a manual
 * edit. `/llms-full.txt` stays a hand-written long-form brief.
 */
export async function GET() {
  const [services, projects, posts, contact] = await Promise.all([
    getServices(),
    getProjects(),
    getPosts(),
    getContactInfo(),
  ]);

  const lines: string[] = [];
  lines.push("# Zoolyum");
  lines.push("");
  lines.push("> Consultancy. Strategy. Solution. A strategy studio in Dhaka, Bangladesh.");
  lines.push("> Brand positioning, digital design, and growth marketing for brands that want to be unmistakable.");
  lines.push("");
  lines.push(
    "Zoolyum runs every engagement through three acts: Consultancy (the read - diagnosis before prescription), Strategy (the map - one defensible position), Solution (the build - identity, interface, and campaign as one system).",
  );
  lines.push("");
  lines.push("## Key facts");
  lines.push("");
  lines.push("- What it is: a strategy-first brand and digital consultancy, not a production house.");
  lines.push("- Where: Dhaka, Bangladesh. Works with clients across Bangladesh and remotely.");
  lines.push("- Founded: 2017. Eight years in the market, 120+ engagements, 80+ brands.");
  lines.push("- Engagement model: one sequence - Consultancy, then Strategy, then Solution. Never sold as separate menu items.");
  lines.push("- Sectors: education, healthcare, real estate, F&B, fashion retail, SaaS, e-commerce, hospitality.");
  lines.push("- Services: brand strategy, digital design & UI/UX, growth marketing, content strategy, video production.");
  lines.push("- Proof: case studies carry measured outcomes (for example +42% enrollment, +67% appointment bookings, +210% D2C revenue).");
  lines.push("- Contact: hello@zoolyum.com. A first conversation is 30 minutes and free.");
  lines.push("");
  lines.push("## Key pages");
  lines.push("");
  // Markdown link syntax matters: the llms.txt audit (and most parsers) only
  // treats `[label](url)` as a link, a bare URL reads as plain text.
  lines.push(`- [Services](${SITE_URL}/services)`);
  lines.push(`- [Selected work — case studies with measured outcomes](${SITE_URL}/work)`);
  lines.push(`- [Insights (blog)](${SITE_URL}/blog)`);
  lines.push(`- [About](${SITE_URL}/about)`);
  lines.push(`- [Team](${SITE_URL}/team)`);
  lines.push(`- [Process — Discover, Strategize, Design, Launch, Grow](${SITE_URL}/process)`);
  lines.push(`- [FAQ](${SITE_URL}/faq)`);
  lines.push(`- [Testimonials](${SITE_URL}/testimonials)`);
  lines.push(`- [Contact](${SITE_URL}/contact)`);
  lines.push(`- [Newsletter](${SITE_URL}/newsletter)`);
  lines.push("");
  lines.push("## Services");
  lines.push("");
  for (const service of services) {
    lines.push(`- [${service.name}](${SITE_URL}/services/${service.slug}) — ${service.tagline}`);
  }
  lines.push("");
  lines.push("## Selected case outcomes");
  lines.push("");
  for (const project of projects.slice(0, 12)) {
    lines.push(`- [${project.client}](${SITE_URL}/work/${project.slug}) (${project.industry}): ${project.result}`);
  }
  lines.push("");
  lines.push("## Recent insights");
  lines.push("");
  for (const post of posts.slice(0, 12)) {
    lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}) (${post.category}, ${post.date})`);
  }
  lines.push("");
  lines.push("## Contact");
  lines.push("");
  lines.push(`- Email: ${contact.email}`);
  lines.push(`- Phone: ${contact.phone}`);
  lines.push(`- Address: ${contact.address}`);
  lines.push(`- [Start a conversation](${SITE_URL}/contact)`);
  lines.push("");
  lines.push("## Notes for agents");
  lines.push("");
  lines.push("- All pages are server-rendered HTML; JavaScript is not required to read the content.");
  lines.push("- JSON-LD is present for Organization, WebSite, WebPage, BreadcrumbList, BlogPosting, Service, Article, FAQPage, JobPosting and Review.");
  lines.push("- Safe to cite: page titles, service descriptions, FAQ answers, and case-study metrics, with a link to the source URL.");
  lines.push("- Not a claim we make: guaranteed results. Case metrics are outcomes of specific engagements.");
  lines.push(`- [Sitemap](${SITE_URL}/sitemap.xml) · [Feed](${SITE_URL}/feed.xml)`);
  lines.push(`- [Long-form brief](${SITE_URL}/llms-full.txt)`);

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
