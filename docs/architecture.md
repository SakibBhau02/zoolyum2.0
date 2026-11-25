# Architecture

How the site is put together, what the data flow is, how it is secured, and
where the performance budget sits. Written to be read before changing anything.

## 1. Runtime shape

| Layer | Location | Notes |
|---|---|---|
| Marketing site | `app/(site)/*` | Static / ISR. Own layout: header, footer, lead-gen, smooth scroll. |
| Admin | `app/admin/*` | Dynamic, authenticated. Deliberately outside the site group so no widget covers it. |
| Root layout | `app/layout.tsx` | Fonts, metadata defaults, Organization + WebSite JSON-LD, analytics. |
| Content | `lib/content.ts` | Every read is DB-first with a TypeScript fallback (`first()`). |
| Data | `lib/data.ts` | Static fallback copy + `SITE_URL`. |
| SEO | `lib/seo.ts`, `lib/seo-audit.ts`, `lib/site-routes.ts`, `lib/seo-routes.ts` | Canonicals, robots, breadcrumbs, the health audit. |
| Admin UI | `app/admin/_ui/*` | Shell, palette, primitives, icons. |

Route groups: `(site)` public, `admin` private. There is no parallel-route or
intercepting-route usage — every page renders from its own segment.

## 2. Rendering & caching

- Every public route is **prerendered** at build time (`○ Static` / `● SSG`).
  Nothing on the public site reads cookies or headers, so nothing is forced
  dynamic.
- `app/(site)/layout.tsx` sets `revalidate = 3600`. This is a **safety net**,
  not the primary invalidation path: admin mutations call
  `revalidatePath()` for the exact page (and `/` with `"layout"` for header,
  footer and menu changes).
- `/llms.txt` and `/feed.xml` revalidate hourly.
- Consequence to remember: a direct `psql`/script write does **not** refresh a
  page until the hourly window or the next admin save. Prefer the admin, or
  call `revalidatePath` from the script.

## 3. Data model

Postgres via Prisma (`prisma/schema.prisma`). Collections: `Post`, `Project`,
`Service`, `TeamMember`, `Testimonial`, `Job`, `MenuLink`, `SeoMeta`,
`Redirect`, `NotFoundLog`, `Lead`, `Media`, `SiteSetting`, `Revision`,
`AdminUser`, `AdminSession`, `AuditLog`.

Copy lives in `SiteSetting` as flat `key → value` rows (`home.hero.titleA`,
`seo.about.description`, …). The admin Settings screen is generated from
`app/admin/settings/registry.ts`, which groups keys by intent, not by prefix.

`lib/content.ts` normalises rows into typed objects. Every getter is wrapped in
`cache()` (per-request dedupe) and falls back to the TypeScript copy in
`lib/data.ts` if Postgres is unreachable — which is why a database blip
degrades rather than 500s.

## 4. SEO / AEO system

- `pageMeta()` is the single metadata entry point: setting → `SeoMeta` override
  → generated. It always emits canonical, Open Graph (`type`, `site_name`,
  `locale`, image), Twitter large card, and robot directives.
- Structured data: Organization + WebSite site-wide; `WebPage` +
  `BreadcrumbList` on static routes; `Service`, `BlogPosting`, `Article`,
  `FAQPage`, `JobPosting`, `Review`, `ItemList`, `Blog`, `CollectionPage`,
  `HowTo` on their templates.
- `PageSchema` renders route-level JSON-LD on the server. Every JSON-LD block —
  route schema, detail pages, the root graph — goes through `jsonLdHtml()`,
  which escapes `<` so CMS copy cannot break out of the script tag.
- `/llms.txt` is generated from the CMS; `/llms-full.txt` is hand-written.
- `/admin/seo/health` audits all of it live: reachability, robots, sitemap,
  llms.txt, feed, verification, metadata coverage, duplicates, noindex,
  404s, redirects, content depth.

## 5. Security model

**Identity.** Passwords are scrypt (`N=16384, r=8, p=1`) with a per-user salt.
Sessions are random 256-bit tokens; only the SHA-256 hash is stored, in an
httpOnly / SameSite=Lax cookie. Expired sessions are pruned on admin load.
Five failed logins lock the account for 15 minutes (DB-backed, so it survives
serverless instances). Roles: owner > admin > editor > viewer, enforced in
`requireUser()` and every server action via `actionUser()`.

**Headers** (`next.config.ts`): HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, COOP, and an **enforced** CSP
(`Content-Security-Policy`, not Report-Only) with `unsafe-eval` dropped in
production. A nonce-based policy was deliberately not used: Next requires
dynamic rendering for nonces, which would undo the static/ISR output.

**Redirects.** `proxy.ts` only honours same-origin paths or explicit
`http(s)` URLs — a database row cannot become an open redirect or a
`javascript:` URL.

**Server actions.** Next's origin check protects against cross-site posts; each
action re-checks the role and writes an `AuditLog` row.

**Known gaps** (accepted for now):
- CSP still allows `'unsafe-inline'` for Next's bootstrap script and the
  animation layer's inline styles. A nonce policy would trade static rendering
  for it; revisit only if the threat model changes.
- `npm audit` reports 3 high, all in the Prisma CLI chain (`prisma` →
  `@prisma/config` → `effect`). Dev-time codegen only; no fix exists without
  a breaking `--force`. Re-check on the next Prisma major.

## 6. Performance budget

Measured on a production build (`next start`), homepage, cold cache:

| Metric | Value |
|---|---|
| JS transfer | ~185 KB |
| Fonts | ~131 KB (3 families) |
| CSS | ~16 KB |
| Total | ~316 KB |
| FCP (local) | ~0.98 s cold, ~0.26 s warm |

What changed to get here:

- **GSAP removed from every bundle.** `SmoothScroll` used GSAP's ticker and
  ScrollTrigger only as a clock; it now runs its own `requestAnimationFrame`.
  `HeroBackdrop` used `gsap.quickTo` for cursor parallax; it now lerps in a
  rAF that stops when settled. `gsap` no longer appears in any static chunk.
- **Decorative layers deferred.** Particles, scroll rail and signal flash load
  with `next/dynamic` + `ssr: false`, off the hydration path.
- **Images are SVG** (`/blog/*/cover.svg`, `/work/*/01.svg`), so
  `unoptimized` is correct — there is nothing for the image optimiser to
  re-encode.

Rules for future work: keep `use client` boundaries small; never import an
animation library into the site layout; prefer CSS for anything that does not
need a timeline; check `/admin/seo/health` after a route-level change.

## 7. Tracking & consent

- IDs live in `SiteSetting` (`analytics.*`) and are read on the server. Empty
  ID = the tag is never rendered, so an unconfigured site ships zero
  third-party JavaScript.
- **GA4 runs one way only:** either the direct `gtag` snippet or, when a GTM
  container is set, through GTM. Never both, which is what double-counts.
- **Page views:** the landing view comes from the tag's own `config`/`init`.
  App Router navigations send one explicit `page_view` (GA4) or `PageView`
  (Meta). The tracker compares the last path, so React StrictMode's double
  mount cannot add a phantom view.
- **Leads:** `createLead` stores the form, then `trackServerLead` sends Meta
  CAPI and GA4 Measurement Protocol in parallel. The browser fires Meta
  `Lead` / GA4 `generate_lead` / Google Ads `conversion` with the same
  `event_id`, so Meta dedupes browser and server into one conversion.
- **Consent:** Consent Mode v2 defaults are set inline before any tag loads.
  `window.__zy_consent` carries the same decision to the two platforms that do
  not understand Google's consent signal: Meta gets `consent revoke/granted`,
  and Clarity is **not injected at all** until the visitor accepts.
- **Attribution:** first-touch landing page, referrer, UTM and click IDs live
  in `sessionStorage`, travel with the lead, and are stored as
  `payload.__attribution`. The leads inbox renders them as a source badge.
- `/admin/tracking` shows integration status, sends real test events, logs
  every server attempt, and lists what each platform still needs in its own
  dashboard.

## 8. What I would do next

1. Re-audit the CSP quarterly; if a nonce policy ever becomes worth dynamic
   rendering, the change is contained to `next.config.ts` + `proxy.ts`.
2. Add an image/CDN note: SVG covers are sharp but not responsive — a raster
   variant would cut bytes on mobile if covers ever become photographic.
3. Split `Chapter1Brief` and `Chapter2FieldNotes` interactive state into their
   own client islands if the homepage JS budget grows.
4. Re-check `npm audit` on the next Prisma major (the remaining 3 highs are in
   its CLI chain).
