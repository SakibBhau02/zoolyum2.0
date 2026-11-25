# Zoolyum — Production Readiness QA
**Date:** 25 November 2026  
**Scope:** full site (public + admin code paths), production build, HTTP/SEO crawl, mobile/desktop Lighthouse, live form flows, CSP, dependency audit  
**Build under test:** Next.js 16.4.6 · React 19.2.8 · Prisma 7 · Neon Postgres · R2 storage

> **Status (25 Nov 2026, later the same day):** the P0/P1/P2/P3 items below have been implemented in this working tree. See **§9 — Fix log** for the exact changes and the fresh verification numbers. Two items still need account access: set the new Vercel env vars (`R2_PRIVATE_BUCKET`, `RESEND_API_KEY`, `EMAIL_FROM`, `LEAD_NOTIFY_EMAIL`, `CRON_SECRET`) and verify the private bucket has no public domain.

---

## 0. Executive summary

The site is **very close to launchable**. The visual layer, SEO fundamentals, 404/redirect behaviour, caching, accessibility baseline and core forms are in good shape. What is left is mostly **operations and edge-case correctness**, not redesign.

| Area | Status | Verdict |
|---|---|---|
| Build / TypeScript | ✅ | `next build` success, 61 route entries, `tsc --noEmit` 0 errors |
| Lint | ⚠️ | 35 errors, **all from scratch files in `artifacts/`** — no product-code errors |
| Public pages | ✅ | 34 sitemap URLs all 200; correct 404/308; all internal links & images 200 |
| Core forms | ✅ / ⚠️ | Contact wizard + newsletter store leads correctly; failure UI is broken |
| Large uploads | ❌ | **Any upload > 1 MB returns HTTP 413** (Next Server Action default) |
| Privacy / PII | ❌ | **Candidate CVs are publicly downloadable from R2** |
| CSP | ⚠️ | Enforced, but blocks R2 images and YouTube thumbnails |
| Accessibility | ✅ / ⚠️ | Blog/careers/work 100; home 96 and contact 96 (contrast) |
| SEO / structured data | ✅ / ⚠️ | Titles/descriptions/canonicals/JSON-LD good; per-page OG cards unused |
| Performance (mobile) | ✅ / ⚠️ | LCP 1.5 s in lab; 89 % of it is a deliberate opacity animation delay |
| Dependencies | ⚠️ | 3 high advisories, all in the Prisma CLI build chain |

**Launch blockers (fix before DNS switch):** P0-1 … P0-5 below.  
**The audit itself was read-only; the fixes in §9 were applied immediately after it.** Test leads and the 404 log row created during testing were deleted; only the three real career CVs were migrated from the public bucket to the private one.

---

## 1. What was actually tested

| Check | Method | Result |
|---|---|---|
| Build | `npm run build` | ✅ 61 pages/route entries |
| Types | `npx tsc --noEmit` | ✅ 0 errors |
| Lint | `npm run lint` | ❌ 35 errors, only `artifacts/*.cjs` |
| HTTP crawl | all 34 sitemap URLs + 19 extra routes | ✅ 200/404/308 all correct |
| Metadata | title, description, canonical, robots, OG/Twitter image on every URL | ✅ lengths in range, canonicals all `www` |
| Links | 49 unique internal links | ✅ 0 broken |
| Images | 58 unique `<img src>` | ✅ 0 broken |
| Structured data | every JSON-LD block parsed | ✅ all valid; 3 semantic gaps |
| Security headers | `curl -D -` | ✅ 6/6 + no `X-Powered-By` |
| Lighthouse | home, blog post, work case, contact, careers, newsletter | a11y 96–100, SEO 100, BP 96 |
| Mobile perf | 390×844, 4× CPU, Fast 4G trace | LCP 1.506 s, CLS 0.00 |
| Bundle | production chunks | 835 KB decoded JS / ~220 KB brotli on home |
| Forms | contact wizard end-to-end, newsletter end-to-end | ✅ lead created → verified → deleted |
| Failure paths | newsletter oversized field; 2 MB careers resume | ❌ both show a fake success state |
| Mobile menu | open, focus trap, Escape, focus restore | ✅ |
| Work filter / lightbox / FAQ | click, focus, Escape | ✅ |
| Reduced motion | `prefers-reduced-motion: reduce` | ✅ no animation, native scroll |
| Consent | first visit, GA/Clarity/Meta gating | ✅ Clarity not injected before accept |
| npm audit | `npm audit` | ⚠️ 3 high (Prisma CLI chain only) |

---

## 2. P0 — must fix before production

### P0-1. Candidate CVs are public on R2 (privacy incident waiting to happen)

**Evidence:** three resume PDFs are readable without auth:

```
/uploads/1792511740687-…pdf → 200 application/pdf (79,876 bytes, starts with %PDF-)
/uploads/1794558670781-…pdf → 200
/uploads/1795201004241-…pdf → 200
```

`STORAGE_DRIVER="r2"`, `R2_PUBLIC_URL` points at a `pub-….r2.dev` host, and `createLead()` saves career attachments through the same public `saveFile()` path as marketing images. Every URL is also stored in the `Media` table and in `Lead.payload.resume`.

**Why it matters:** a CV contains name, phone, address and work history. A public bucket is a personal-data breach under GDPR/Bangladesh DPA, and search engines can index it if the URL ever leaks.

**Fix (recommended):**
1. Create a **second, private bucket** (e.g. `zoolyum-private`) or use a `private/` prefix with public access disabled.
2. Store career attachments with `visibility: "private"` in `Media` (new column) and never return their URL to a public page.
3. Serve downloads through an admin-only route that generates a **5–15 minute presigned GET URL** (`@aws-sdk/s3-request-presigner`).
4. Keep the public bucket only for marketing images.
5. Rotate/delete the three exposed objects; assume they may already be copied.
6. Add a `Cache-Control: private, no-store` + `Content-Disposition: attachment` on the proxy route.

**Minimum interim fix:** disable `r2.dev` public access on the bucket, then re-enable only for the public-image bucket.

---

### P0-2. Uploads over 1 MB are rejected — careers and admin media are broken

**Evidence:** a real 2 MB PDF submitted through `/careers` returned `500` and the server logged:

```
Error: Body exceeded 1 MB limit.
statusCode: 413
```

Next.js 16 caps Server Action request bodies at **1 MB by default**. The app advertises/validates up to 10 MB (`lib/storage.ts: MAX_DOC_BYTES = 10 MB`, `MAX_BYTES = 5 MB`), so most phone photos and normal PDFs fail — and the UI still shows “Received. We reply within a day.”

**Fix:** in `next.config.ts`:

```ts
experimental: {
  optimizePackageImports: ["motion", "@gsap/react", "lenis"],
  serverActions: { bodySizeLimit: "12mb" }, // 10 MB doc + multipart overhead
},
```

Then add application-level caps in `createLead` (see P1-2) so the raised limit cannot be abused. Admin media upload (`uploadMedia`) uses the same action body limit, so this also fixes image uploads > 1 MB.

---

### P0-3. Exit-intent form never stores or sends the email

**File:** `components/leadgen/ExitIntentModal.tsx:103–108`

```tsx
onSubmit={(e) => {
  e.preventDefault();
  if (email.trim()) setDone(true); // ← no createLead call
}}
```

The modal says “Check your inbox — the checklist is on its way”, but nothing is persisted, no event is fired, and the user receives nothing. This is the highest-intent lead source on the site.

**Fix:** reuse the proven path:

```tsx
const ctx = newLeadContext();
const r = await createLead("exit-intent", { email: email.trim() }, ctx);
if (r.ok) { fireBrowserLead("exit-intent", ctx); setDone(true); }
else setError(r.error ?? "Something went wrong…");
```

Add an error state and do not show success until the server confirms.

---

### P0-4. Lead magnets promise an email that the system cannot send

**Evidence:** no email provider exists in `package.json` or `lib/` (no Resend, Postmark, SendGrid, Nodemailer, SMTP). Yet:

- `ResourceGate` → “The file is on its way to your inbox”
- `ExitIntentModal` → “the checklist is on its way”
- Newsletter → “You're on the list. First insight arrives next month.”

Leads are stored correctly, but **nothing is delivered automatically**. If the team is manually emailing from the admin inbox, the copy is still false (“on its way” implies automation).

**Fix (choose one):**
- **Recommended:** integrate a transactional provider (Resend or Postmark), add a `sendLeadMagnet()` / double-opt-in confirmation, and log delivery in `TrackingEvent`.
- **Minimum:** change copy to “We'll email it to you within one working day” and add an admin “needs follow-up” badge/filter.

This is a business blocker, not a code crash: every lead magnet currently over-promises.

---

### P0-5. Production migrations are not part of the deploy

`package.json` has `db:migrate` (dev) but **no `db:deploy`**, and `scripts/vercel-setup.ps1` only sets env vars and deploys. On a fresh Neon database the app will start with missing tables — public pages may fall back to static copy, but admin/login/leads/SEO all 500.

**Fix:**
1. Add `"db:deploy": "prisma migrate deploy"` and run it in CI/Vercel (build command or a one-off release step).
2. Document `prisma db seed` for a fresh environment.
3. Add a health check that verifies the `AdminUser` and `Post` tables exist.
4. Seed the owner before opening `/admin/login` (or keep the bootstrap path, see P2-10).

---

## 3. P1 — fix in the first week

### P1-1. Every `FormShell` form shows success before the server answers

**Verified:** submitting a newsletter form with a 6,000-character field returned a server error, yet the button displayed **“You're on the list. First insight arrives next month.”** and became disabled, with the error text below it.

**Cause:** `SubmitButton` sets `done` on the native `submit` event (`components/pages/Forms.tsx:115–121`); it has no knowledge of the server result. `FormShell` transitions to `error` but cannot reset the button.

**Fix:** make `FormShell` the single source of truth:

```tsx
<SubmitButton status={state} … />   // idle | sending | done | error
```

Disable only while `sending`; on `error`, restore the button and show `r.error`.

Also surface the server message (`too long`, `too many submissions`, etc.) instead of the generic “email hello@zoolyum.com”.

### P1-2. Files are written before the lead is validated, with no aggregate cap

`app/admin/actions.ts:876–896` saves each uploaded file to R2 **before** checking the email and before `MAX_TOTAL_CHARS`. A crafted request can attach up to `MAX_FIELDS = 30` files of 10 MB each (≈300 MB) with an invalid email, repeatedly, from rotating IPs.

**Fix:**
1. Validate email and total text **first**.
2. Allow attachments only for `kind === "careers"`, max 1 file, max 10 MB.
3. On any later failure, delete the saved key (`removeFile`).
4. Store private attachments outside the public URL space (see P0-1).

### P1-3. Rate limiting is per server instance only

`lib/rate-limit.ts` is an in-process `Map`. On Vercel, a bot hitting different lambdas gets a fresh bucket each time. Login still has the DB lockout, but public lead spam does not.

**Fix:** move the lead/login counter to a shared store (Upstash Redis, Vercel KV, or a `RateLimit` table with an atomic upsert). Keep the in-memory limiter as a fast local guard.

### P1-4. CSP blocks legitimate images

**Verified in the browser:**

```
Loading 'https://i.ytimg.com/vi/…/hqdefault.jpg' violates
img-src 'self' data: blob: https://www.google-analytics.com …
```

**Impact:**
- Admin media library thumbnails from R2 render blank (`app/admin/media/media-client.tsx:79`).
- Any case-study YouTube thumbnail is blank (`components/pages/CaseGallery.tsx` uses `unoptimized`).
- Any uploaded photo inserted into content is blocked if it renders as a plain `<img>`.

**Fix:** build `img-src` from the same R2 env used by `images.remotePatterns`:

```ts
const r2Origin = (() => {
  try { return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).origin : ""; }
  catch { return ""; }
})();
// img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com ${r2Origin} …
```

Also add `https://i.ytimg.com` / `https://img.youtube.com` for thumbnails. Re-test the admin media page after the change.

### P1-5. Contrast regressions on `/` and `/contact`

Lighthouse (axe 4.14) reports:

| Page | Node | Ratio | Needed |
|---|---|---|---|
| `/` | `Chapter1Brief` numeral `text-ivory/45` | 4.01 | 4.5 |
| `/` | `HorizontalChapter` hint `text-ivory/45` | 3.90 | 4.5 |
| `/contact` | decorative “Mirpur 11” `text-sienna/10` | 1.11 | 3.0 |

**Fix:** replace `text-ivory/45` with `text-ivory/62` (or a token that maps to ≥4.5:1 on espresso/umber) in `Chapter1Brief.tsx`, `Chapter2FieldNotes.tsx`, `HorizontalChapter.tsx`. For the decorative watermark, either raise it to `/25`–`/30` or render it as an SVG with `aria-hidden` (axe still measures text nodes even when `aria-hidden`).

### P1-6. `llms.txt` fails the agentic-browsing audit

Lighthouse score 67; the only failure is `llms-txt`: **“File does not appear to contain any links.”**

The file uses bare URLs (`- Services: https://…`). The audit expects Markdown links. Convert to:

```md
- [Services](https://www.zoolyum.com/services)
- [Selected work](https://www.zoolyum.com/work)
```

Do the same for services, case studies, posts and contact. This directly improves how AI answer engines traverse the site.

### P1-7. Per-page Open Graph images exist but are never used

`app/(site)/services/[slug]/opengraph-image.tsx`, `work/[slug]/…`, `blog/[slug]/…` are built as dynamic routes, but the page metadata explicitly sets `openGraph.images` to the **root** card:

- `services/[slug]/page.tsx:43`
- `work/[slug]/page.tsx:44`
- `blog/[slug]/page.tsx:55`

Next therefore never injects the file-convention URL. Every service, case study and article share shows the same generic card, and the dynamic OG routes are dead code.

**Fix:** only set `images` when an admin override exists:

```ts
openGraph: {
  …,
  ...(override?.ogImage
    ? { images: [{ url: override.ogImage, width: 1200, height: 630, alt: title }] }
    : {}),
}
```

Then verify `og:image` points at `/services/<slug>/opengraph-image-…` and returns 200. (The earlier QA note that “Next injects it automatically” is only true when `images` is not set.)

### P1-8. No error boundary and no monitoring

There is no `app/error.tsx`, `app/global-error.tsx`, or Sentry/uptime hook. A DB or render failure in production shows Next's bare “Application error” screen and nobody is notified.

**Fix:** add a branded `error.tsx` (and `global-error.tsx`), log to Sentry or Axiom, and configure an uptime check on `/`, `/contact`, `/api/…`.

### P1-9. Admin media / project images can be blocked by the same CSP (P1-4)

Covered above, but test explicitly: log in → `/admin/media` → confirm R2 thumbnails render after adding the host.

---

## 4. P2 — polish, SEO and operations

| # | Issue | File / detail |
|---|---|---|
| P2-1 | Case-study `Article` has no `datePublished` | `work/[slug]/page.tsx:107` — add `datePublished` (use `updatedAt`/created date) |
| P2-2 | Article `image` is an SVG; Google rich results want raster ≥1200 px | `blog/[slug]/page.tsx:116`, `work/[slug]/page.tsx:114` — put the 1200×630 PNG OG card first |
| P2-3 | Case-study schema image URL breaks for absolute CMS URLs | `work/[slug]/page.tsx:115` — `${SITE_URL}${ogImage.src}` becomes `https://sitehttps://r2…`; use `new URL(src, SITE_URL).href` |
| P2-4 | Organization schema has no `postalCode` | `app/layout.tsx` — add `postalCode: "1216"` |
| P2-5 | Work filter is state-only | `/work` — put `?industry=` in the URL so results are shareable and Back works |
| P2-6 | Collapsed FAQ answers stay in the accessibility tree | `FaqAccordion.tsx:44` — add `hidden`/`inert` or `aria-hidden` when closed (grid-rows/opacity is visual only) |
| P2-7 | Cookie banner covers the work filter and hero hint | `ConsentBanner.tsx` — add bottom padding to the page or make the banner a slimmer bar |
| P2-8 | Lint fails on scratch files; `artifacts/` not ignored | Add `artifacts/**` to `globalIgnores` in `eslint.config.mjs` and to `.gitignore` (≈6 MB of QA images) |
| P2-9 | Dead code / unused deps | `three`, `@types/three`, `lib/hero-scene.ts`, `components/home/Chapter1Noise.tsx`, `satoshi-*.woff2` (76 KB), default `public/*.svg`, `scripts/replace-*.js`; remove or archive |
| P2-10 | `ADMIN_SECRET` is unused legacy | `.env.example`, `scripts/vercel-setup.ps1`, docs still instruct generating it; remove |
| P2-11 | No password-reset CLI | `ADMIN_PASSWORD` only bootstraps the first user; add `scripts/reset-admin.ts` |
| P2-12 | Expired sessions accumulate | `pruneSessions()` is only called at login; call it from the admin layout or a cron |
| P2-13 | Audit/Revision/NotFound/Tracking rows grow forever | Add a retention job (e.g. 90 days) |
| P2-14 | RSS `lastBuildDate` is “now” | `app/feed.xml/route.ts:45` — use the newest post date |
| P2-15 | 404 page title is the site default | add `export const metadata = { title: "Page not found" }` to `not-found.tsx` |
| P2-16 | No `twitter:site` / `theme-color` / web manifest | low-impact metadata polish |
| P2-17 | SVG uploads accepted | `lib/storage.ts` — SVG can carry script; serve with `Content-Disposition: attachment` or disallow for public media |
| P2-18 | `NotFoundLog` path has no length cap | `/api/not-found` — cap at ~512 chars |
| P2-19 | `robots.txt` has non-standard `Host:` | harmless; remove if you want a clean spec |
| P2-20 | Redirect rule lookup hits the DB once/min per instance | `proxy.ts` — cache with `unstable_cache` or build a static map |
| P2-21 | No tests / CI | add `typecheck` script + Playwright smoke tests (contact, newsletter, careers, admin login, 404, sitemap) and a CI job running `tsc`, `lint`, `build`, `audit` |

---

## 5. Performance — measured, prioritised

### 5.1 Current numbers (production build, local)

| Metric | Home | Notes |
|---|---|---|
| DOM nodes | 1,258 | Excellent (blog post: 459; was 10,341 in the old build) |
| JS decoded | 835 KB | 23 chunks |
| JS brotli | **~220 KB** | Largest: React 60 KB, scheduler 30 KB, motion 35 KB, lenis 16 KB |
| CSS decoded | ~131 KB | ~16 KB brotli |
| Fonts | 128 KB | General Sans 66 KB (3 weights) + Inter/Serif |
| Mobile LCP | **1.506 s** | TTFB 167 ms + **render delay 1.339 s (89 %)** |
| CLS | 0.00 | |
| Third-party main-thread | 261 ms | GTM/GA |
| Desktop LCP | 475 ms | local, no throttling |

### 5.2 Highest-impact actions

1. **Remove the opacity delay from the LCP element.**  
   The LCP node is the hero subtext, which is `opacity: 0` until a 320 ms-delayed 500 ms animation (`app/globals.css:566`, `Hero.tsx:48`). 89 % of mobile LCP is this deliberate fade.  
   **Target:** start visible (opacity 1) and animate only `transform`, or cut delays to 0/80/140/200 ms. Expected mobile LCP ≈ 0.6–0.8 s with no visual loss.

2. **Disable Lenis on touch devices.**  
   `SmoothScroll.tsx` runs Lenis on every device. Native mobile scrolling is cheaper and improves INP. Keep Lenis for `(pointer: fine)` desktops only.

3. **Cut JS below the fold.**  
   220 KB brotli is high for a marketing site.  
   - `next/dynamic` the interactive chapters that are not in the first viewport (already done for decoration).  
   - Replace Framer Motion `AnimatePresence` in the header with CSS transitions where possible.  
   - Remove `three` + `lib/hero-scene.ts` (dead code) from dependencies.  
   **Target:** < 150 KB brotli on `/`.

4. **Trim fonts from 128 KB to < 80 KB.**  
   Drop General Sans 700 and let 600 handle bold (saves ~21 KB); delete the unused `satoshi-*.woff2` files (76 KB in repo, not shipped but confusing); keep Instrument Serif non-preloaded.

5. **Stop the prefetch storm.**  
   On first load the header prefetches 7–8 RSC payloads (`/about`, `/services`, `/work`, …). Set `prefetch={false}` on nav links or prefetch on hover only. Saves requests and mobile data; pages are already fast.

6. **Load GTM only after interaction/consent.**  
   GTM spent 261 ms on the main thread in the mobile trace. Since Consent Mode is on, consider injecting GTM after the consent choice or after first interaction, not on page load.

7. **Batch settings reads.**  
   The site layout does ~12 separate `SiteSetting` queries per render. Replace with one `findMany({ where: { key: { in: [...] } } })`. This mostly helps ISR revalidation and cold starts, not LCP.

8. **Select only needed columns in list queries.**  
   `getPosts()` fetches full `body`, `faqs`, `images` for the index; `getProjects()` fetches every field for the home page. Use `select` so payloads stay small as content grows.

9. **Keep the current caching.**  
   `s-maxage=3600, stale-while-revalidate=31532400` is correct. Add explicit `Cache-Control` for `/opengraph-image` and any R2 public assets.

10. **Use `next/image` for real photos.**  
    Today all imagery is SVG, so `unoptimized` is correct. The moment real photos arrive, remove `unoptimized`, set `sizes`, keep `priority` only on the hero, and serve AVIF/WebP.

11. **Budget guard.**  
    Add Lighthouse CI (mobile) with budgets: LCP < 1.8 s, INP < 200 ms, CLS < 0.1, JS < 180 KB brotli. Run on every PR.

---

## 6. Pre-launch checklist

**Infrastructure**
- [ ] R2 public access disabled for the CV bucket; private downloads via signed URLs; exposed files rotated
- [ ] `DATABASE_URL` uses Neon pooler + `sslmode=verify-full`
- [ ] `PG_POOL_MAX` set so `instances × pool` stays under the Neon limit
- [ ] `prisma migrate deploy` runs in the release pipeline; seed/owner account created
- [ ] `ADMIN_PASSWORD` rotated to a 24+ char random value (bootstrap only; DB password after first login)
- [ ] Backups + restore drill documented
- [ ] Uptime monitor + error tracking (Sentry/Axiom)

**Configuration**
- [ ] `experimental.serverActions.bodySizeLimit = "12mb"` + upload caps
- [ ] CSP `img-src` includes R2 host + `i.ytimg.com`
- [ ] Consent mode verified in the target regions; privacy policy lists Clarity session recording
- [ ] GSC + Bing verification tokens set; sitemap submitted
- [ ] Real social URLs in Settings (LinkedIn/Facebook already set; Instagram/YouTube empty is fine)
- [ ] `NEXT_PUBLIC`/analytics IDs verified in production (GA4, Clarity, Meta)

**Quality gates**
- [ ] `tsc`, `lint`, `build` green (fix the `artifacts/` lint failure)
- [ ] Lighthouse mobile: a11y 100, SEO 100, BP ≥ 95, LCP < 1.8 s
- [ ] Submit all forms in production staging: contact, newsletter, resource gate, careers (with a 2 MB PDF), exit intent
- [ ] Verify leads appear in `/admin/leads` and the email actually arrives
- [ ] Verify 404 status, `/territory` 308, sitemap, feed, llms.txt, OG images
- [ ] Verify admin upload > 1 MB succeeds and the thumbnail renders
- [ ] Verify mobile menu, gallery lightbox, FAQ, work filter on a real phone

---

## 7. Suggested fix order

**Today (blockers)**
1. Private R2 bucket + rotate CVs (P0-1)
2. `serverActions.bodySizeLimit` + upload caps (P0-2, P1-2)
3. Exit-intent lead capture (P0-3)
4. Email delivery or honest copy (P0-4)
5. `db:deploy` migration step (P0-5)

**This week**
6. Form failure-state fix (P1-1)
7. CSP `img-src` (P1-4)
8. Shared rate limiter (P1-3)
9. Contrast tokens (P1-5)
10. `llms.txt` links (P1-6)
11. Per-page OG images (P1-7)
12. Error boundary + monitoring (P1-8)

**Next sprint**
13. Hero LCP animation change
14. Lenis off on touch; JS/font trimming; prefetch control
15. Article schema dates/raster images; Organization `postalCode`
16. Dead code/deps cleanup; CI + Lighthouse budgets
17. FAQ `inert`, filter URL state, banner spacing
18. Password reset CLI, session/audit retention

---

## 8. Test artefacts

Screenshots from this pass: `.playwright-mcp/qa-home-desktop.png`, `qa-home-mobile.png`, `qa-work-desktop.png`, `qa-case-desktop.png`.  
The production server used for the audit was `npm start` on port 3100; it can be stopped after review.

---

## 9. Fix log — implemented 25 November 2026

### 9.1 Verification after the changes

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (the `artifacts/*.cjs` failures are gone) |
| `npm run build` | ✅ 63 route entries |
| `npm run smoke` (33 checks) | ✅ all pass |
| Lighthouse `/` desktop | **100 / 100 / 100 / 100** (a11y / BP / SEO / agentic) |
| Lighthouse `/` mobile | **100 / 100 / 100 / 100** |
| Mobile Lighthouse on /work, /blog, /contact, /careers, /faq, service | **100 / 100 / 100 / 100** on every page |
| Mobile lab LCP (390×844, 4× CPU, Fast 4G) | **1,506 ms → 861 ms** (−43 %) |
| Home JS | 680 KB decoded / ~197 KB brotli, 19 chunks |
| First visit, before consent | 0 third-party scripts, 0 cookies, 0 analytics preconnects |
| Public CV URLs | **200 → 404** (moved to private bucket) |
| 2 MB careers PDF | **413 → accepted**, stored privately, lead created |
| Newsletter server error | button stays enabled, shows the real error |
| Per-page OG cards | service / work / blog each return 200 hashed PNG |
| `npm audit` | **0 vulnerabilities** (patched `effect` override) |
| Console errors | 0 on all 16 public pages tested |

### 9.2 What changed

| # | Fix | Files |
|---|---|---|
| P0-1 | Private bucket + private storage + authenticated download route; existing 3 CVs moved, public objects deleted, lead payloads updated | `lib/storage-private.ts` (new), `app/admin/attachment/route.ts` (new), `app/admin/actions.ts`, `app/admin/leads/page.tsx`, `scripts/privatize-leads.ts` (new), `.env`, `.env.local`, `.env.example` |
| P0-2 | Raised Server Action body limit to 12 MB; per-request attachment caps (1 file, 10 MB) and validation-before-save | `next.config.ts`, `app/admin/actions.ts` |
| P0-3 | Exit-intent now stores the lead, fires tracking, shows real errors, traps focus | `components/leadgen/ExitIntentModal.tsx`, `app/(site)/layout.tsx` |
| P0-4 | Resend transactional email layer (confirmation + admin notification, no-op without a key); honest copy when email is not configured | `lib/email.ts` (new), `app/admin/actions.ts`, `components/pages/ResourceGate.tsx`, `components/leadgen/ExitIntentModal.tsx` |
| P0-5 | `db:deploy`, CI migration step, `vercel-setup.ps1` now runs `prisma migrate deploy` | `package.json`, `.github/workflows/ci.yml` (new), `scripts/vercel-setup.ps1` |
| P1-1 | Form state owned by `FormShell`; `SubmitButton` reads context, never shows success before the server answers | `components/pages/Forms.tsx` |
| P1-2 | Email validated before storage; career-only attachments; aggregate cap; cleanup on failure | `app/admin/actions.ts` |
| P1-3 | DB-backed shared rate limiter (`RateLimit` table, atomic upsert) for leads and admin login | `lib/rate-limit.ts`, `prisma/schema.prisma`, migration `20261125120000_rate_limit` |
| P1-4 | CSP now allows the R2 origin + YouTube thumbnails; verified in-browser | `next.config.ts` |
| P1-5 | Contrast tokens fixed on home, contact watermark replaced with an SVG pin | `Chapter1Brief.tsx`, `Chapter2FieldNotes.tsx`, `HorizontalChapter.tsx`, `contact/page.tsx` |
| P1-6 | `llms.txt` uses Markdown links; agentic-browsing score 67 → 100 | `app/llms.txt/route.ts` |
| P1-7 | Per-route OG cards are used again; verified 200 for service/work/blog | `services/[slug]`, `work/[slug]`, `blog/[slug]` metadata |
| P1-8 | Branded error boundaries + `instrumentation.ts` request error logging | `app/error.tsx`, `app/global-error.tsx`, `instrumentation.ts` (new) |
| P2-1/2/3 | Article `datePublished`, raster image first, absolute-URL-safe CMS image | `work/[slug]/page.tsx`, `blog/[slug]/page.tsx` |
| P2-4 | Organization `postalCode` | `app/layout.tsx` |
| P2-5 | Work filter is shareable via `?filter=` and survives Back/Forward | `components/pages/WorkGallery.tsx` |
| P2-6 | Collapsed FAQ panels are `inert` | `components/ui/FaqAccordion.tsx` |
| P2-7 | Consent banner moved to the bottom-right on desktop (no longer covers the work filter) | `components/analytics/ConsentBanner.tsx` |
| P2-8 | `artifacts/` ignored by ESLint + git | `eslint.config.mjs`, `.gitignore` |
| P2-9 | Removed `three`, `gsap`, `@gsap/react`, `motion`, dead `Chapter1Noise`/`hero-scene`/`ZigzagLoader`, unused fonts and default SVGs | `package.json`, deleted files |
| P2-10 | Removed unused `ADMIN_SECRET` from example/deploy; kept only `ADMIN_PASSWORD` bootstrap | `.env.example`, `scripts/vercel-setup.ps1` |
| P2-11 | `npm run db:reset-admin` recovery CLI | `scripts/reset-admin.ts` (new) |
| P2-12 | Expired sessions pruned on admin load | `app/admin/layout.tsx` |
| P2-13 | Retention script + Vercel Cron route | `scripts/prune.ts`, `app/api/cron/prune/route.ts`, `vercel.json` |
| P2-14 | RSS `lastBuildDate` uses the newest post | `app/feed.xml/route.ts` |
| P2-15 | 404 page has its own title + noindex | `app/not-found.tsx` |
| P2-16 | `theme-color`, dark color-scheme and web manifest | `app/layout.tsx`, `app/manifest.ts` |
| P2-17 | SVG uploads are forced to download on R2 | `lib/storage-r2.ts` |
| P2-18 | 404 log path capped at 512 chars | `lib/seo.ts` |
| P2-19 | Removed non-standard `Host:` from robots.txt | `app/robots.ts` |
| P2-20 | Redirect-rule cache extended to 5 minutes | `proxy.ts` |
| P2-21 | `typecheck`/`smoke` scripts + GitHub Actions (Postgres service, migrations, tsc, lint, build, audit) | `package.json`, `scripts/smoke.mjs`, `.github/workflows/ci.yml` |
| P3 | Footer entity sentence, X social support, `humans.txt`, `security.txt`, header CTA href now reads its setting, PageSpeed artefacts | `Footer.tsx`, `lib/content.ts`, `Header.tsx`, `(site)/layout.tsx`, `public/*` |

### 9.3 Mobile performance changes

1. Hero LCP reveal is **transform-only**; the opacity fade that delayed LCP by ~1.3 s is gone. Delays shortened to 0/90/160/220/300 ms.
2. **Lenis runs on fine pointers only**; phones use native scrolling.
3. **Framer Motion removed from every route** (header menu + blog/work/testimonials filters are CSS animations now).
4. **Ambient particle canvas not mounted on phones**, and its chunk is not requested.
5. Hero atmosphere (rays, blade sway, stalk runners, fireflies, motes, grain) is **static under 768 px**.
6. Header nav links no longer prefetch 7–8 RSC payloads on first load (`prefetch={false}`).
7. Analytics preconnects and tags are **consent-gated**, so a first-time visitor downloads no GTM/GA/Clarity/Meta JavaScript and opens no third-party connections.
8. `Tilt` only sets `will-change` on fine pointers.

### 9.4 Still needs account access (not code)

1. Add the new env vars to Vercel Production **and** Preview, then redeploy: `R2_PRIVATE_BUCKET`, `RESEND_API_KEY`, `EMAIL_FROM`, `LEAD_NOTIFY_EMAIL`, `CRON_SECRET`. `scripts/vercel-setup.ps1` does this in one pass.
2. `zoolyum-private` was created and the three CVs were moved; public URLs now return 404. Confirm in the Cloudflare dashboard that no public domain is attached to it.
3. Verify the Resend sending domain (SPF/DKIM) so confirmations actually deliver.
4. Run `npm run db:reset-admin -- --email … --password …` if the owner password is not already known; `ADMIN_PASSWORD` only bootstraps an empty user table.
5. Submit the sitemap to GSC/Bing if that is not already done.
