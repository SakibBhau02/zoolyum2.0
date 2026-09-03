# Admin CMS + DB-Driven Site — Design Spec

Date: 2026-09-03. Status: approved (5 sections + "shuru koro").
Decisions: password-gate auth, full scope, everything DB-driven with TS fallback.

## 1. Data layer

`lib/content.ts` async accessors: getPosts, getPost(slug), getProjects,
getProject, getServices, getService, getTeam, getJobs, getTestimonials,
getSetting(key), getContactInfo. DB first via `lib/prisma.ts`; on connection
failure fall back to `lib/data.ts` equivalents with console.warn (dev safety
only - production path is always DB).

All `generateStaticParams` and page reads switch to accessors. New models:
`Testimonial {quote, author, company, industry, sort}`, `SiteSetting
{key @unique, value}` seeded with per-page SEO titles/descriptions, hero
leads (plain-text parts), and CONTACT info.

## 2. Auth

`/admin/login` (server action): timing-safe compare of submitted password
against `ADMIN_PASSWORD`; on success set httpOnly, SameSite=Lax,
sealed cookie `admin_session = base64(payload).base64(hmac)` via node:crypto
with `ADMIN_SECRET`. Guard `/admin/*` (except login) in middleware/proxy -
verify Next 16 file convention before writing. Logout clears cookie.
No new dependencies.

## 3. Admin UI (site design language)

Routes under `/admin`: dashboard (counts, unread leads, quick links);
`posts|projects|services|team|jobs|testimonials` list + `[id]` editor;
`settings` grouped form; `leads` inbox (mark read/unread, delete);
`media` library (upload, copy URL, delete). Editors: scalar inputs,
string-array inputs (one-per-line textareas), Json fields validated
JSON textareas. All mutations are Server Actions with revalidatePath on
affected public routes. Every button wired - no dead UI.

## 4. Images

`lib/storage.ts` interface {save, remove} + local driver writing to
`public/uploads/` (gitignored) and recording Media rows. GCS driver later
behind STORAGE_DRIVER env - no call-site changes. Existing SVGs stay in repo.

## 5. Public-site wiring order

Collections first (blog, work, services, team, jobs, testimonials reads),
then settings (SEO meta helper, contact info, hero leads), then
generateStaticParams. Build requires DATABASE_URL (Docker locally).

## 6. Verification

Playwright (auth gate redirect, login, CRUD roundtrip incl. publish ->
visible on site -> delete, leads read/delete, upload + URL copy),
`npx tsc --noEmit`, `npm run lint`, `npm run build` clean.

## 7. Non-goals

No Google OAuth (later), no roles/permissions, no GCS (later, keys pending),
no visual page-builder, no draft preview URLs (publish is immediate +
revalidated).