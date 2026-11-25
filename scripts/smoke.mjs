/**
 * Dependency-free production smoke test.
 *
 *   SMOKE_BASE_URL=https://www.zoolyum.com npm run smoke
 *   npm run smoke                     # assumes next start on :3000
 *
 * Covers the things that silently broke before: status codes, canonicals,
 * the 404 boundary, OG cards, the feed/llms surfaces and security headers.
 */
const BASE = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed += 1;
}

async function get(path) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const body = await res.text();
  return { res, body };
}

const pages = ["/", "/services", "/work", "/about", "/team", "/contact", "/blog", "/resources", "/careers"];

for (const path of pages) {
  const { res, body } = await get(path);
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(body)?.[1] ?? "";
  check(`${path} 200`, res.status === 200, String(res.status));
  check(`${path} canonical`, canonical.startsWith("https://www.zoolyum.com"), canonical);
}

{
  const { res } = await get("/definitely-not-a-real-page-qa");
  check("unknown route 404", res.status === 404, String(res.status));
}
{
  const { res } = await get("/territory");
  check("/territory 308", res.status === 308, String(res.status));
}
{
  const { res, body } = await get("/sitemap.xml");
  const count = (body.match(/<loc>/g) ?? []).length;
  check("sitemap has URLs", res.status === 200 && count >= 30, `${count} URLs`);
}
{
  const { res } = await get("/feed.xml");
  check("RSS feed", res.status === 200 && (res.headers.get("content-type") ?? "").includes("rss"), res.headers.get("content-type") ?? "");
}
{
  const { res, body } = await get("/llms.txt");
  check("llms.txt has markdown links", res.status === 200 && /\[[^\]]+\]\(https?:\/\//.test(body));
}
{
  const { res } = await get("/opengraph-image");
  check("OG image", res.status === 200 && (res.headers.get("content-type") ?? "").startsWith("image/png"));
}
{
  const { res } = await get("/");
  for (const header of [
    "content-security-policy",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
    "strict-transport-security",
  ]) {
    check(`header ${header}`, Boolean(res.headers.get(header)));
  }
  check("no x-powered-by", !res.headers.get("x-powered-by"));
}
{
  const { res, body } = await get("/manifest.webmanifest");
  check("web manifest", res.status === 200 && body.includes("Zoolyum"));
}
{
  const { res } = await get("/.well-known/security.txt");
  check("security.txt", res.status === 200);
}

console.log(failed === 0 ? "\nAll smoke checks passed." : `\n${failed} smoke check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
