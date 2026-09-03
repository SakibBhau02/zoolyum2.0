# Chapter 02 Tagline Visuals — Before/After Compare Sliders

Date: 2026-09-03. Status: approved in chat (4 sections + "shuru koro").

## Goal

Replace the three Chapter 02 diagram visuals beside Consultancy / Strategy /
Solution with a completely new concept. Structure, copy, opener (2.0), and
lockup (2.4) stay untouched.

## Concept (Approach 1, approved)

Each act''s visual is an interactive before/after comparison slider: left of
the divider is the problem, right is the Zoolyum outcome. Dragging the divider
performs the transformation. One unified interaction across all three acts.

- 2.1 Consultancy: blurred jumble of marketing words -> one sharp sienna
  sentence + clean rows. Dragging focuses noise into signal.
- 2.2 Strategy: crowded dot cluster in the middle -> crowd faded to the
  edges, glowing planted flag with ring on open ground.
- 2.3 Solution: five scattered tilted mini-cards -> aligned system row with
  a connecting thread.

## Architecture

- New reusable client component `CompareSlider` in
  `components/home/Chapter2Terrain.tsx` (props: `before` / `after` nodes,
  `beforeLabel` / `afterLabel`, `initial` percent). If it grows past ~120
  lines, split to `components/home/CompareSlider.tsx`.
- Three scene components `ReadCompare`, `MapCompare`, `BuildCompare` replace
  `ReadDiagram`, `MapDiagram`, `BuildDiagram` in the same grid slots
  (`lg:col-span-7`) with the existing captions below.
- Reuse: `.diagram-card` shell + `.diagram-glow` ambient halo. Delete the
  v5.9.1 per-diagram keyframes (signal-flow, beacon-ping, mod-float, etc.)
  and the v6.1 living-instrument extras they replaced.
- Scenes are DOM + CSS only (no SVG graphs, no canvas, no new deps).

## Interaction

- Pointer: drag the knob OR anywhere on the panel (Pointer Events unify
  mouse/touch). Position clamped 4-96%.
- Keyboard: `role="slider"`, Arrow keys move 5%, `aria-valuenow` + labels.
- First-view hint: knob nudges 50 -> 68 -> 50 once via rAF, IO-gated, then
  stops. Never auto-loops.
- After-side carries a gentle infinite glow pulse (transform/opacity only).
- Reduced motion: static 50/50 split, no nudge, no pulse; keyboard works.
- Mobile: full-width panel, 44px touch target on the knob.

## Visual language

- Before side: desaturated, slight blur, cool gray. After side: warm ivory
  + sienna glow accents on Espresso.
- Divider: 2px sienna line + circular knob with left/right arrows.
- Corner chips: "BEFORE" / "AFTER". Caption below each panel (existing copy).

## Files

- `components/home/Chapter2Terrain.tsx` — replace 3 components, add slider.
- `app/globals.css` — remove v5.9.1 diagram keyframes, add compare-slider
  styles + reduced-motion rules.

## Verification

- Playwright: pointer drag changes reveal %, keyboard arrows work, mobile
  390px layout, reduced-motion snapshot, 0 h-scroll, 0 console errors.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` clean.

## Non-goals

- No copy changes, no opener/lockup changes, no new pages or routes,
  no new dependencies, no image assets.