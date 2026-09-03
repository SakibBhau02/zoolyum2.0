# Work Case Studies + Full-Site SEO — Design Spec

Date: 2026-09-03. Status: approved (Approach A + 5 sections + "shuru koro").
Decisions: content drafted by agent from existing data (user reviews),
SEO scope = full site.

## 1. Goal

Two focuses: (1) a professional, detailed case-study page per project
(problem, solution, how-overcame, toolbox, FAQ) and (2) a client journey
that converts (proof -> objection-handling -> CTA -> next case -> contact).
Plus a full-site SEO/AEO/AGO pass so every route is discoverable, extractable,
and citable.

## 2. Data model (additive)

New optional fields on `Project` in `lib/data.ts`, shipped as an appended
`PROJECT_META: Record<slug, {...}>` block (existing literals untouched):

- `overview: string` — 40-60 word answer-block paragraph.
- `obstacles: { title: string; how: string }[]` — what blocked + how overcome.
- `toolbox: string[]` — software/tools used, grouped at render by prefix
  (`Design:`, `Build:`, `Growth:`, `AI:`) or plain chips if ungrouped.
- `faqs: { q: string; a: string }[]` — 3 per project, grounded in the case.
- `deliverables: string[]` — tangible outputs.

Template falls back gracefully when a field is missing (section hidden).

## 3. Page structure (`app/work/[slug]/page.tsx`, one template)

Hero (H1 title, client/industry/timeline chips, metrics bar, cover) ->
Snapshot glance-card -> Problem (editorial + obstacle list) -> Solution
(strategy + approach answer block) -> How we overcame (numbered moves +
obstacle-to-fix pairs) -> Toolbox (grouped chip grid) -> Gallery (existing
CaseGallery) -> Results (stats + client quote) -> FAQ (accordion, FAQPage
JSON-LD) -> Conversion CTA (contact + primary service link) -> Next case.
JourneyRail chapters extended. Sticky mobile CTA bar after Results.

JSON-LD: Article (dateModified, wordCount) + BreadcrumbList + FAQPage.
Meta: problem-led title, absolute OG/Twitter images.

## 4. Full-site SEO pass

Every route gets: unique title/description/canonical, OG + Twitter cards
with absolute URLs, applicable JSON-LD, one H1, descriptive alts.
Priority depth (answer blocks, FAQ schema, internal links) on home,
services (+5 slugs), work (+8 slugs), blog (+6 slugs), contact, about.
Hygiene pass on team, testimonials, careers, faq, newsletter, resources,
privacy, terms. Verify sitemap + robots, expand `public/llms.txt`.

No AI-only hidden content (Google scaled-content-abuse safe).

## 5. Files

- `lib/data.ts` — append PROJECT_META (8 projects).
- `app/work/[slug]/page.tsx` — rewrite into dossier template.
- Reuse blog FAQ accordion pattern; new toolbox/conversion components
  inline in the page (split out only if >150 lines).
- `app/globals.css` — dossier styles (metrics bar, obstacle pairs,
  toolbox chips, sticky mobile CTA).
- Per-page metadata/schema edits across `app/**/page.tsx` + layout.
- `public/llms.txt` — expand.

## 6. Verification

- Playwright: all 8 case pages + key templates, desktop + 390px,
  reduced-motion, 0 h-scroll, 0 console/hydration errors.
- JSON-LD parse check per template; FAQ toggles; CTA links resolve.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` clean.

## 7. Non-goals

No copy changes outside new fields, no new routes, no new deps,
no image assets, no CMS migration.