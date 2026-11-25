import { getPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/data";

/**
 * RSS 2.0 feed at /feed.xml.
 *
 * Costs one route handler and gives feed readers, aggregators and newsletter
 * tooling a stable subscription surface without scraping the blog index.
 */
export const revalidate = 3600;

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const posts = await getPosts();
  const lastPostDate = posts[0]?.date ? new Date(posts[0].date) : new Date();
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${escape(post.category)}</category>
      <description>${escape(post.excerpt)}</description>
      ${post.author ? `<author>hello@zoolyum.com (${escape(post.author)})</author>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zoolyum - Insights</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Strategy, branding and market notes from a Dhaka consultancy.</description>
    <language>en</language>
    <lastBuildDate>${(Number.isNaN(lastPostDate.getTime()) ? new Date() : lastPostDate).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
