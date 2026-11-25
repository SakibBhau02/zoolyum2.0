import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

/**
 * Crawler policy.
 *
 * Everything public is open, including the answer-engine crawlers that quote
 * pages in AI results — that is the point of the AEO work. Only the admin, the
 * API and user uploads are closed, because those are not content and should
 * never appear in an index.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "DuckAssistBot",
  "meta-externalagent",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/uploads/", "/_next/"],
      },
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/api/", "/uploads/"] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/admin", "/api/", "/uploads/"] },
      // Answer engines read the same pages as search — allow them explicitly.
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/admin", "/api/", "/uploads/"] })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
