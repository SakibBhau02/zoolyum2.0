# Admin rebuild + SEO/AEO/GEO engine — implementation plan

> Status: Phase 0 in progress. Decisions locked with the owner on 2026-11-14.

## Locked decisions

| Decision | Choice |
|---|---|
| Build order | Admin panel first, then SEO/AEO, then speed/security polish |
| Admin approach | In-place rebuild on Next.js + Prisma, own design system (no CMS migration) |
| Auth | Multi-user, roles (owner → viewer), DB sessions, audit log |
| Workflow | Autosave + revision history + draft → review → live |
| SEO/AEO tools | Per-item SEO, SERP/social preview + score, redirects + 404 log, GSC/Bing dashboard, llms.txt + AI crawler status, IndexNow, schema builder, keyword/internal-link suggestions |
| Language | English |
| Visual | Dark espresso + sienna brand, denser and calmer than the marketing site |
| Infra | Migrations may run on production Neon; Upstash may be added later; prod deploys are owner-run |

## Architecture

```
app/admin/
  layout.tsx            shell: sidebar, topbar, ⌘K, user menu
  page.tsx              dashboard (KPIs, SEO health, recent activity)
  _ui/                  design system: primitives, table, drawer, toast
  [collection]/         list + data table (server search, filter, pagination)
  [collection]/[id]/    editor (autosave, revisions, preview, SEO tab)
  settings/             humanised settings workspace
  seo/                  SEO/AEO workspace
    page.tsx            health overview + per-route matrix
    [path]/             per-route metadata editor
    redirects/          redirect manager
    not-found/          404 log
  users/                team + roles
  audit/                activity log
  login/                email + password
```

### Data model additions

- `AdminUser` — email, name, scrypt password hash, role, active, lockout counters
- `AdminSession` — hashed token, expiry, ip, user-agent (revocable)
- `AuditLog` — actor, action, entity, entityId, diff, ip, createdAt
- `Revision` — collection + recordId + JSON snapshot + author
- `SeoMeta` — per-path title/description/OG/canonical/noindex/keywords/schema
- `Redirect` — source, destination, status, hits
- `NotFoundLog` — path, hits, first/last seen
- `Post.status` / `Project.status` — draft | review | published (published boolean kept in sync)

### Indexes

`Lead(read, createdAt)`, `Lead(kind, createdAt)`, `Post(published, date)`,
`Project(published, sort)`, `MenuLink(visible, group, sort)`, `Media(createdAt)`,
plus the new tables' foreign-key and sort indexes.

### Auth flow

1. `proxy.ts` does an **optimistic** cookie-presence check only (docs: proxy is not a
   full auth solution) and redirects to `/admin/login`.
2. `app/admin/layout.tsx` and every protected page call `requireUser()` which reads the
   session from the DB through a per-request `cache()`.
3. Every mutating server action calls `requireUser(minRole)` and writes an `AuditLog` row.
4. Login is rate-limited in the DB (`failedAttempts`, `lockedUntil`) so it works across
   serverless instances. Optional Upstash later.

### Editor workflow

- Debounced autosave (3s) updates the draft row; explicit **Publish** moves status forward.
- Every save writes a `Revision`; the editor exposes a revision drawer with restore.
- Backwards compatible with the old body format (`## ` heading prefix) — the block editor
  serialises back to the same paragraph array, so existing posts render unchanged.

## Phases

- **Phase 0** — schema, auth, audit, indexes, admin CSS layer.
- **Phase 1** — shell, dashboard, collection table, settings, users, audit, editor upgrade.
- **Phase 2** — SEO workspace, schema builder, redirects, 404 log, llms.txt, IndexNow, GSC.
- **Phase 3** — speed budget, image pipeline, caching, Lighthouse CI.

## Non-goals (this pass)

- Migrating to a third-party CMS.
- Changing the public site design.
- Changing the public content URLs.

---

## Shipped in this pass

**Database** — migration `20261114000000_admin_rebuild_foundation` applied to production Neon:
new `AdminUser`, `AdminSession`, `AuditLog`, `Revision`, `SeoMeta`, `Redirect`, `NotFoundLog`
tables; `status` on Post/Project with a backfill; secondary indexes on the hot read paths.

**Auth** — scrypt password hashes, DB-backed sessions (only the token hash is stored),
four roles, per-account lockout after five failures, session revocation, bootstrap owner
from `ADMIN_PASSWORD` while the user table is empty, and an audit entry for every mutation.

**Admin** — new shell (sidebar, ⌘K palette, mobile drawer, DB status), rebuilt dashboard,
server-side data table (search, status filter, pagination, bulk publish/delete),
humanised settings with section search and character counters, media library with alt-text
editing, team/access management, activity log, SEO workspace, per-route metadata editor
with SERP/social preview and checks, redirect manager, broken-URL log, version history,
and draft → review → published control.

**SEO/AEO** — per-item metadata overrides wired into **every** static page
(via `pageMeta`) plus blog, service and case-study `generateMetadata`;
schema-type override merged into service JSON-LD; DB redirects served from the
proxy with a 60-second cache; IndexNow on publish; 404 capture via a client
beacon; generated `/llms.txt`; sitemap `lastmod` for services/work and
`noindex` exclusion; Search Console + Bing dashboard.

**Performance** — secondary indexes, request-level `cache()` on the hot content
getters, tunable `PG_POOL_MAX`, accent-font preload removed, AVIF/WebP image
formats, optimised package imports.

**Editors** — three-second debounced autosave with a "Draft saved" indicator,
revision history with restore, and draft → review → published.

**Security** — magic-byte upload verification, HSTS, sandboxed `/uploads`,
`noindex` + `no-store` posture on the admin, DB-backed login throttling.

## Still open (next pass)

1. Search Console / Bing API dashboard — built, but needs `GSC_*` / `BING_*`
   credentials in the environment before it shows numbers.
2. `llms-full.txt` is still a hand-written file in `public/`.
3. Bundle/font budget: accent-font preload dropped, AVIF/WebP enabled and
   package imports optimised, but the marketing pages still carry three motion
   libraries and a large DOM. A Lighthouse CI budget is the next step.
4. The body editor remains paragraph-based. Autosave, revisions and the
   draft/review/published workflow are live; a block model would be a larger
   content migration.

