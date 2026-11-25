# Hero — “The Market Board” (3D, four beats)

> **Superseded 2026-11-15.** The homepage no longer mounts this sequence.
> Chapter 01 is now “The Brief Table” — see `docs/chapter-01-brief.md`.
> The code and copy are kept for reference/rollback:
> `components/home/Chapter1Noise.tsx`, `lib/hero-scene.ts`,
> `Three.js CSS` and the `home.hero.beat*` settings.

> Implemented 2026-11-14. Replaces the abstract CSS layers that users could
> not decode (STILL / NOISE / FOG / SIGNAL).

## Why the old version failed

- Four beats ran in 0.85 viewport of scroll (~190 px each): no dwell time.
- Four different visual languages (floating words, silhouettes, network,
  comet) with no legend, so nothing connected.
- Poetic labels had no explanation and the viewer had no job.

## The new sequence

One continuous low-poly market board, one metaphor, four states. Scroll is the
only driver (cinematic), but each state is caused by a visible change.

| Beat | Board | Poetic headline | Plain caption |
|---|---|---|---|
| STILL | Low, even grid; slow drift | “Every market starts still.” | Before anyone moves, it looks peaceful. |
| NOISE | Blocks spike, warm up, jitter; noise meter climbs | “Most brands respond to that by shouting louder.” | More ads, bigger claims, same offer. |
| FOG | Heights converge, colour drains, fog thickens | “In the fog, most brands start to look the same.” | Buyers cannot tell you apart. |
| SIGNAL | Fog clears, one line draws across, one block rises and lights | “In that noise, only one line ever cuts through.” | One defensible position makes the choice obvious. |

## Implementation

- `lib/hero-scene.ts` — Three.js orthographic scene: instanced blocks (144
  desktop / 64 mobile), fog, lights, a hero block, a beam, a ring and the
  signal thread. One draw call for the field; no shadows or textures.
- `components/home/Chapter1Noise.tsx` — sticky section (no GSAP pin-spacer),
  ScrollTrigger drives progress, direct DOM writes switch beats (no React
  re-render inside the pinned area).
- Three.js is a lazy chunk (~130 KB gzip) and only boots when the section is
  near the viewport. Rendering pauses off-screen and on hidden tabs.
- Reduced motion: no canvas, no sticky — four static, readable sections.
- The sequence is skippable (button + mobile skip), and all copy remains in the
  DOM for search engines.

## Why sticky instead of GSAP pin

Pinning re-parents the section into `.pin-spacer` outside React's knowledge.
Any later commit inside that subtree can throw
`Failed to execute 'removeChild' on 'Node'`. CSS sticky provides the same
visual pin with no DOM re-parenting and less scroll work.

## Content

New CMS keys (editable in Homepage / Settings):

- `home.hero.beatStill`, `home.hero.beatStill.plain`
- `home.hero.beatB.plain`, `home.hero.beatC.plain`, `home.hero.beatD.plain`

## SIGNAL, second pass — meteor impact

The first SIGNAL pass (a raised block plus a thin thread) read as static and
unclear. It is now an event with a cause:

1. **A meteor falls** from the upper sky toward the chosen block, with a
   tapered, additive gradient trail and a glowing head.
2. **On impact**: a flash sprite, an expanding shockwave ring, a warm point
   light that briefly lifts the nearby blocks, and a ground halo.
3. **The seam**: three additive shader layers (soft halo, mid glow, hairline
   core) spread outward from the landing point — a gradient that visibly cuts
   across the board. It only grows *after* impact; the block rises with it.
4. Scrolling back to FOG resets the whole event so it can replay.

## Background and idle life

- Procedural sky: vertical gradient + horizon glow + two soft nebulae +
  ordered dithering to prevent banding.
- 460 star points and 16 larger glow stars, twinkling slowly.
- Two drifting warm haze planes behind the board.
- A distant low skyline (64 instanced blocks) for depth in STILL/NOISE.
- Ambient meteors streak across the backdrop every 2.5–6s.
- The board breathes, dust drifts, the grid pulses, and the camera has a
  micro-drift so the frame never looks frozen.



## Two separate scroll-driven chapters

The Method and Selected Work are intentionally **separate sections**, each with
its own traverse:

- `HorizontalChapter` provides the mechanic: a tall section, a CSS-sticky
  panel, and vertical scroll translating that chapter's own card track.
- **The Method** (`#chapter-method`): 5 stage cards, `STAGE 01 / 05` counter,
  its own progress bar and arrows.
- **Selected Work** (`#chapter-work`): 8 projects plus the closing CTA,
  `PROJECT 01 / 08` counter, its own progress bar and arrows.
- The Results section stays between them, and the page order is unchanged:
  Method → Results → Work.
- Mobile and reduced-motion keep native snap rails per section.

## Next

- Chapter 2 (the tagline chapter) still has three near-identical compare
  sliders; a sticky act index and per-act service links were proposed but not
  built.


