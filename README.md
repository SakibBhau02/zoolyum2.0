# Zoolyum — Consultancy. Strategy. Solution. (v5.1)

The Zoolyum brand website, rebuilt to the v5.0 design specification: an editorial, eye-soothing, strategy-first experience where "Own the Jungle" lives on as the internal brand instinct — never named on the page.

**Stack:** Next.js 16 (App Router, Turbopack) · Tailwind CSS v4 · GSAP ScrollTrigger · Motion (Framer Motion) · TypeScript

## Getting started

```bash
npm install
npm run dev      # development
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## The v5.0 concept

| Layer | Content |
|---|---|
| **Tagline (spoken)** | "Consultancy. Strategy. Solution." — logo lockup, hero, meta, footer |
| **Brand voice (felt)** | Own the Jungle — the strategist's instinct: read the pattern first, move while others guess. Expressed in tone and pacing only, never named on the page |

### Design system

- **Palette:** Espresso Charcoal `#241F1B` · Sienna Amber `#C9702E` · Muted Olive `#7A7A5C` · Warm Ivory `#F6F1E8` · Deep Umber `#3A2E26` · Dusty Gold `#B99456`
- **Terrain Gradient:** `#241F1B → #3A2E26 → #C9702E` — reads as a horizon, not a color jump
- **The Signal Thread:** a single fine amber line introduced narratively in Chapter 1, recurring sitewide (scroll indicator, card top edges, footer rule, logo lockup) as the recall-building signature stroke
- **Type:** General Sans (display, Medium/Semibold) · Inter (body) · Instrument Serif italic (accent quotes)

### Homepage — the 7-chapter strategy briefing

Chapter 1 is a fully choreographed four-beat sequence: **1a The Held Breath** (stillness + one pulsing amber point) → **1b The Noise Builds** (marketing-noise fragments at three parallax speeds) → **1c The Fog Thickens** (overlapping brand-mark silhouettes, scrim deepens to 70%) → **1d The Signal Thread** (one amber line cuts through and migrates up to become the scroll indicator). Then: Reading the Terrain → The Method → The Results → Ground We've Helped Clients Hold → What Clients Say (Warm Ivory clearing) → CTA.

### The Legibility System (non-negotiable, spec §07)

1. Scrim-on-demand between text and moving backgrounds (40–70%)
2. Text-safe zones: background layers are CSS-masked to near-stillness/≤15% opacity behind active text
3. WCAG AA 4.5:1 contrast floor — accessible sienna tint (`#CE7A34`) for buttons/small text
4. Ambient motion pauses (~80% slowdown) while the reader pauses — scroll-idle detection
5. Body copy capped at ~65ch via `max-width` containers
6. No kinetic effects through letterforms

### Memorability & lead generation (spec §14)

Five sequenced capture points — never more than one visible at any scroll position:
1. **End of Ch.1** — inline skip prompt ("See how we help brands cut through — skip to our work")
2. **After Ch.4** — sticky "Get a Free Brand Audit" corner tab (session-persistent, auto-hides near other prompts)
3. **Resources** — email-gated guides (Brand Audit Checklist is the flagship magnet)
4. **Ch.6** — inline newsletter: "One strategic insight a month. No noise."
5. **Exit-intent modal** — desktop only, one time per session, cursor-exit triggered (never scroll/time)

## Project structure

```
app/                    # Routes (App Router) — /work (was /territory, permanent redirect in place)
components/
  layout/               # Header, Footer, Logo, TerrainScrollIndicator, ReadingPause, SoundProvider
  home/                 # Homepage chapters 1–7 (Ch.1 = the 4-beat choreography)
  ui/                   # LinkButton, Reveal (Reveal-on-Read + Horizon Wipe), StatCounter, ConfidenceIndicator…
  pages/                # Shared inner-page blocks (PageHero, Forms, WorkGallery, TestimonialWall…)
  leadgen/              # SkipPrompt, AuditTab, ExitIntentModal
lib/
  data.ts               # All content: services, projects, team, posts, jobs
  hooks.ts              # useMediaQuery
app/fonts/              # Self-hosted General Sans
```

## Accessibility & performance

- Full `prefers-reduced-motion` support — Ch.1 degrades to stacked plain crossfades; every effect reduces to a fade
- Chapter 1 caps at 3 concurrent background layers on mobile (spec §13)
- Transform/opacity-only motion; scroll-bound ambient drift pauses while reading
- Keyboard focus rings, skip-to-content, ARIA labels, two-state text contrast throughout

## Content

All copy lives in `lib/data.ts` and `lib/posts-content.ts` — swap for Sanity (or another headless CMS) without touching components.

### v5.1 — Ambient motion & interactivity layer

- **HeroBackdrop** — layered cinematic ground on every hero: drifting gradient mesh, diagonal light rays, topographic contours, swaying blade silhouettes, floating motes, film grain, mouse parallax
- **AmbientParticles** — a sitewide canvas of slow-drifting motes (pauses while reading, thins on mobile, absent for reduced-motion)
- **ThreadCursor** — the Signal Thread as a cursor: tracks movement direction, expands to a three-stroke mark over interactive elements
- **Magnetic buttons** + **3D card tilt** on work and pillar cards
- **Dual testimonial rivers** — two always-moving marquee rows in opposite directions (hover pauses; static grid for reduced motion)
- **Industry ticker** — an always-moving strip between chapters
- **Chapter 1 v5.1** — live Market Noise meter (0→95→0%), four-step beat indicator, network-map fog, comet-led Signal Thread sweep
- **Easter egg** — triple-click the logo for a viewport-wide thread sweep
- **4 new case studies** (Healthcare, Fashion Retail, SaaS, Hospitality — 8 total) and **3 new pages**: /newsletter, /faq, /process

## Design review

`design-review/` contains verification screenshots: hero (held breath), beat 1c fog, beat 1d signal sweep, results on umber, the Warm Ivory voices section, work, contact, and the 404.