# Admin expansion — organised specification

> Source: the owner's request on 2026-11-14. This file turns the scattered
> prompt into a checklist so nothing is lost. Implementation status is tracked
> at the bottom.

## 1. Audit every admin page

- Walk every route and confirm: auth guard, new design system, working save
  path, empty state, pagination where a list can grow.
- Remove leftover marketing-`.btn` / `.card-surface` styling from admin pages.

## 2. Tracking, server-side and client-side

Everything needed to run measurement properly, not just a GA snippet:

### Client
- GTM container (keeps GA4 inside GTM when a container ID exists).
- Direct GA4 fallback when no GTM.
- Microsoft Clarity, Meta Pixel.
- **Google Ads** tag (`AW-…`) when an ID is present.
- Manual `page_view` on App Router navigation (already).
- `generate_lead` / `lead` event on form success.
- **Consent Mode v2** with a banner (optional, settings-controlled):
  default denied → granted on accept, persisted, revocable.

### Server
- Meta Conversions API with shared `event_id` for dedupe.
- GA4 Measurement Protocol with the browser `client_id`.
- Both must record a row in `TrackingEvent` so the admin can show what was
  sent, what failed, and why.
- Capture attribution with every lead: landing page, referrer, UTM
  (source/medium/campaign/term/content), `gclid`, `fbclid`, `msclkid`.
- Expose a **test send** action per provider from the admin.

### Admin
- `/admin/tracking`: integration status matrix (configured / missing / disabled),
  editable IDs (secrets masked), test buttons, recent event log, event map,
  consent switch.
- Settings keys are created on first save, so a new integration needs no deploy.

## 3. Blog posts and case studies

- Auto-generate slug from the title (with a button, never destructive).
- Inline image rows: upload, alt/caption required warning, reorder up/down.
- Gallery and FAQ rows: reorder up/down.
- Character counters and SERP preview already exist; add a direct “SEO for this
  page” link from the editor.
- Keep the draft → review → published workflow and version history.

## 4. Image uploads

- Convert uploads server-side with `sharp`:
  - photos → **WebP** (quality 82), auto-rotate, max 2400 px on the long edge,
    metadata stripped;
  - SVG stays SVG;
  - documents stay untouched.
- Store real `width`, `height`, `mime`, `size` after conversion.
- Reject files whose bytes do not match an allowed format.
- Admin shows the converted format and dimensions.

## 5. Non-goals

- A third-party CMS.
- Server-side GTM container hosting.
- Rewriting the public site design.

---

## Status

- [x] Organised spec (this file)
- [x] Audit pass — every admin route guarded, new design system applied
- [x] Image pipeline — sharp → WebP, 2400 px cap, dimensions recorded
- [x] Tracking schema + server senders + event log (`TrackingEvent`)
- [x] Consent Mode v2 + banner (settings switch, currently **on**)
- [x] `/admin/tracking` — status, IDs, test sends, event log, event map
- [x] Blog/case-study editor upgrades — reorder rows, alt warnings, SEO link
- [x] Build + live verification

## Verification notes

- PNG 3000×2000 (83 KB) → WebP 2400×1600 (6.9 KB); upload path verified through
  the real admin form (110 KB PNG → 13.4 KB WebP, `image/webp`, 1600×1000).
- Test sends produced `TrackingEvent` rows with explicit skip reasons
  (missing Pixel/token, missing MP secret) instead of silent failure.
- Consent banner: denied-by-default script, accept persists `zy_consent=granted`,
  banner disappears, `consent_update` pushed to the dataLayer.
- `tsc --noEmit` clean, `eslint` clean, production build 61 routes.
