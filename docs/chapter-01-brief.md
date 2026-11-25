# Chapter 01 — “The Brief Table” (interactive, five calls)

> Implemented 2026-11-15. Replaces the pinned 3D market board as the section
> after the hero. The board code (`components/home/Chapter1Noise.tsx`,
> `lib/hero-scene.ts`) is intentionally kept for reference/rollback but is no
> longer mounted.

## What it does

One real engagement (Apex Academy), opened up. The visitor makes five calls:

1. Discover — what do you read first?
2. Strategize — what do you claim?
3. Design — what carries the claim?
4. Launch — where does the season start?
5. Grow — what do you protect?

Each call reveals the option Zoolyum actually chose, the trade-off behind the
other paths, a work artifact, and (at Grow) the measured outcome. The finale
connects the five calls and hands over to the case study.

## Why the board was replaced

- 3,060px of scroll (3.4 viewports) for a passive cinematic; the viewer had no job.
- ~130KB gzip Three.js chunk on the homepage.
- Showed no workflow and no work.
- The new section is ~1,000px, canvas-free, and puts the method and the proof in
  the visitor's hands.

## Interaction

- Click/tap an option; the evidence panel reveals “What we did”, the trade-off
  copy for a different choice, and the artifact.
- A five-node rail above the table shows the workflow; completed calls can be
  revisited (read-only) and return to the current call.
- “See all five calls” is the passive/screen-reader fallback: it fills the real
  calls and opens the summary.
- Mobile: the table stacks; the evidence panel gets its own Back/Next controls
  and the sheet scrolls back into view on advance.
- Progress is stored in `sessionStorage` (`zoolyum.brief.v1`); “Run it again”
  clears it.
- Reduced motion: no auto-animation; CSS transitions only.

## Data

- Scenario: `SiteSetting.home.brief.scenario` (JSON), typed by
  `lib/engagement.ts` (`BriefScenario`, `BRIEF_DEFAULT`, `parseBriefScenario`,
  `validateBriefScenario`).
- Flat UI copy: `home.brief.*` keys in `lib/home-copy.ts`.
- Client, industry, services, quote, stats and the case link are **derived from
  the project named by `projectSlug`** — they are not duplicated in the scenario.
- Invalid saves are rejected in `app/admin/actions.ts`; an invalid/missing DB
  row falls back to `BRIEF_DEFAULT`.
- Seed/migration: `scripts/migrate-home-v8.ts` (`npm run content:home-v8`) and
  `prisma/seed.ts`.

## Admin

`Admin → Homepage → 2 · The Brief`:

- Project dropdown (case study).
- Brief number/title/situation.
- Five stage accordions with question, 2–4 options (radio = “what we did”),
  reveal copy, optional metric, artifact kind/title/caption/items/image.
- Summary copy and a “Reset to default”.

## Artifact kinds

`note`, `position`, `crest`, `flow`, `film`, `case`, `image`.

The default Apex run uses `note`, `position`, `flow`, `film`, `case`. The
artifact `title`, `caption`, `items` and `src` are all CMS-editable; the case
artwork reuses the project gradient and monogram so no fake screenshots are
needed.

## Testimonials

Chapter 06 was restored to the original two-river layout (with the newsletter
capture). The heading is back to “In their words.”; the featured-quote/evidence
version was removed.
