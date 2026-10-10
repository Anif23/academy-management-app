# Academy Project - Public Website Integration

## Project Overview
This project is a modern public-facing Academy website that consumes an existing Academy Management system's APIs. The existing system is the sole source of truth for all academic and administrative data.

## Architecture
```text
NEW PUBLIC ACADEMY WEBSITE (React, TS, Vite, Tailwind, GSAP)
        │
        │ HTTP API (New Public Endpoints)
        ↓
EXISTING ACADEMY BACKEND (Node.js, Express, Prisma)
        │
        ↓
EXISTING DATABASE (PostgreSQL)
        │
        ↓
EXISTING ADMIN APPLICATION (React)
```

## Tech Stack (New Website)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **State Management**: TanStack Query (React Query), Axios
- **Forms**: React Hook Form, Zod
- **Animations**: GSAP, @gsap/react, ScrollTrigger
- **Icons**: Lucide React

## Core API Mapping (Plan)

### 1. Courses
- **Existing API**: `GET /courses` (Admin)
- **Public API**: `GET /public/courses`
- **Purpose**: List all active courses for the landing page.

### 2. Course Details
- **Existing API**: `GET /courses/:id` (Admin)
- **Public API**: `GET /public/courses/:id`
- **Purpose**: Detailed information about a specific course.

### 3. Course Batches
- **Existing API**: `GET /batches` (Admin)
- **Public API**: `GET /public/courses/:id/batches`
- **Purpose**: List available batches for a specific course.

### 4. Registration (Leads)
- **Existing API**: `POST /walkins` (Admin)
- **Public API**: `POST /public/register`
- **Purpose**: Submit a student registration form (creates a `WalkIn` lead).

## Implementation Guidelines
- **Source of Truth**: Never duplicate course or batch data in the frontend. Always fetch from the API.
- **Security**: Create dedicated `/public` routes in the backend that do NOT require `requireAuth` or `requirePermission`, and only expose safe fields.
- **Animations**: Use GSAP for premium feel, but ensure accessibility (`prefers-reduced-motion`).
- **Mobile-First**: Prioritize the registration flow for mobile users (QR code access).

## Development Workflow
1. **Explore**: Inspect existing backend controllers/services.
2. **Backend**: Implement public API endpoints.
3. **Frontend**: Build components and connect them via TanStack Query hooks.
4. **Verify**: Test the flow from Landing $\rightarrow$ Course $\rightarrow$ Batch $\rightarrow$ Register.

## Roles & Permissions (current)
- Login roles: ADMIN, STAFF (trainer), COUNSELLOR, STUDENT. Only Trainer/Counsellor employees get a login; Developer/Designer/Video Editor/Digital Marketing are records only.
- Permissions are granular `module:read|create|update|delete` (plus `*-own` for students), stored in `role_permissions` and edited at Roles & Permissions. Defaults: `backend/src/constants/roles.js`.
- Backend enforces via `requirePermission` (routes). `/auth/me` and login return `permissions[]` for the user's role.
- Frontend UX gating: `usePermission`/`useCan` hooks, `<Can permission=...>`, `PermissionRoute`, nav filtered by `NAV_GROUPS[].permissions`.
- Scoping: trainers see own batches/students; counsellors see own leads/students (`isScopedRole`).

## First-run setup (fresh database)
```
cd backend
npm install
npx prisma migrate deploy   # applies every migration in order, incl. the COUNSELLOR enum + backfill
npx prisma generate
npm run prisma:seed         # runs prisma/seed.js then prisma/seed-public.js — safe to re-run (upserts)
```
`prisma/seed.js` creates the demo ADMIN/STAFF/COUNSELLOR/STUDENT logins and sample academy data.
`prisma/seed-public.js` creates academy settings, FAQs and the announcements ticker content for the
public website. It ships with **no testimonials** on purpose — add real, verifiable student
testimonials from Academy Content → Student Testimonials rather than seeding placeholder ones.

## Announcements / offers ticker
- Model: `Announcement` (`backend/prisma/schema.prisma`). Admin CRUD at `/admin/announcements`
  (`announcements:manage` permission), public feed at `/public/announcements` (active + inside its
  optional start/end window).
- Admin UI: Academy Content → "Announcements & Offers Ticker".
- Public site: `public-website/src/components/navbar/AnnouncementTicker.tsx`, a continuous
  end-to-end marquee fixed above the navbar. It measures its own height into the `--ticker-h` CSS
  variable so the navbar and page content shift down automatically; renders nothing (0 height) when
  there are no active announcements.

## Legal / compliance pass (public website)
- **Pages added**: `/privacy-policy`, `/terms`, `/cookie-policy`, `/refund-policy` (`public-website/src/pages/legal/`).
  Content is written for India's DPDP Act, 2023 (data fiduciary/principal language, rights, grievance
  officer, children's-data consent) and pulls the academy's real name/address/grievance contact from
  Academy Settings — fill those in under Academy Content → Legal & Compliance before launch.
- **Cookie consent**: `components/common/CookieConsentBanner.tsx` + `utils/cookieConsent.ts`. No
  non-essential cookies are set until the visitor chooses. Only "functional" (the Google Maps embed on
  Contact) exists today; "analytics" is a pre-wired category with nothing behind it yet — if analytics
  is added later, gate it on `getStoredConsent()?.analytics` so it doesn't retroactively track existing
  visitors.
- **Registration consent**: the registration form's step 4 now has a real required checkbox linked to
  the Privacy Policy and Terms (previously just a passive sentence, not actual consent).
- **Footer**: now links to all four legal pages and shows the registered legal name/registration number
  when set.
- **Accessibility**: added aria-labels to the mobile menu toggle, logo link, WhatsApp links/button, and
  registration checkbox/error; fixed a mismatched tag from that change; submit button now has visible
  "Submitting…" text instead of a bare spinner; registration failures show an inline message instead of
  `alert()`; bumped a few slate-400-on-white text instances to slate-500 for contrast.

## Known risks flagged, not fully resolved — do before going live
- **Stock media**: the About/Hero sections use hotlinked Unsplash/Pexels photos and video. These
  licenses generally allow commercial use, but hotlinking means they can disappear or change, and using
  generic people's photos as if they were "your" students/campus is a trust risk even if not a legal
  one — replace with the academy's own photos/video when available.
- **Removed a real copyright risk**: the seeded academy `logoUrl` was a hotlinked, watermarked
  Dreamstime *preview* image — not a licensed asset. Removed from the seed; upload a real, owned logo
  in Academy Settings. Also replaced a Hero background video that was hotlinked directly from Canva's
  CDN (`video-public.canva.com`) — that's a raw Canva asset URL, not a redistributable video source —
  with the same Pexels clip already used elsewhere as a safe placeholder. Replace with the academy's
  own footage before launch.
- **Removed fake testimonials from the seed** (see the Roles & Permissions section above) — only add
  real, verifiable student reviews via the admin panel.
- **Grievance Officer / legal name fields are blank by default** — the Privacy Policy page renders
  generic placeholder text until these are filled in; the DPDP Act expects a real contact, not a
  placeholder.
- **This is not legal advice.** The policy text is a reasonable, good-faith starting point aligned to
  the DPDP Act's general structure, but a lawyer should review it before launch, especially the refund
  windows/percentages (currently illustrative: 7-day full refund, 50% up to 20% of classes, then none)
  and the grievance-response timelines.

## Redis — now actually wired in (previously scaffolded but unused)
`ioredis` and `src/config/redis.js` existed already but nothing called them. Wired up for real:
- **Cross-instance permission cache**: `permissionsService` keeps an in-memory Set per role for
  fast synchronous checks on every request. In a multi-instance deployment, an admin's permission
  change on one instance now publishes on Redis channel `permissions:invalidate`; every instance
  (including single-instance/no-Redis setups, where it's a no-op) reloads. Without this, other
  instances would serve stale permissions until they happened to restart.
- **Public read caching** (`src/utils/cache.js`, keys in `src/constants/cacheKeys.js`): academy
  info (120s), site stats (60s), active courses (60s), testimonials/FAQs (120s), announcements
  (30s — shorter because their active/expired state can flip on its own via start/end dates).
  Invalidated on the matching admin write (course/batch/academy-settings/testimonial/FAQ/
  announcement mutations). Falls straight through to Postgres with no caching if `REDIS_URL` isn't
  set — correctness never depends on Redis being up.
- **Shared rate limiting** (`src/middleware/rateLimitMiddleware.js`): `express-rate-limit`'s
  default store is per-process memory, which silently under-counts (and under-protects the login
  endpoint) once you run more than one backend instance behind a load balancer. Now backed by
  `rate-limit-redis` when `REDIS_URL` is set, so every instance shares the same counters; falls
  back to the in-memory store automatically otherwise.

None of this requires any new env var — `REDIS_URL` and the `redis` service were already in
`.env.example` / `docker-compose.yml`. Running without Redis configured still works exactly as
before, just without the shared cache/rate-limit benefits across instances.

## Announcement ticker & scroll fixes
- **Ticker not spanning edge-to-edge**: with only 1-2 short announcements, one lap of content
  was narrower than the screen, so it drifted near the left edge with dead space on the right
  instead of flowing continuously across. Fixed in `AnnouncementTicker.tsx`: the item list is
  now repeated until one lap is at least as wide as the viewport, and the scroll speed is derived
  from the measured width (`PIXELS_PER_SECOND`) so it stays consistent regardless of item count.
- **Footer links landing mid-page**: React Router doesn't reset scroll position on navigation.
  `ScrollToHash` in `App.tsx` now scrolls to top on any plain route change (no hash), and uses a
  `MutationObserver` (instead of a fixed number of quick retries) to wait for a hash target like
  `#faq` to actually exist in the DOM before scrolling, since that section can still be loading
  its own data when the route first renders. `html { scroll-padding-top }` was added so the fixed
  ticker+navbar never covers the destination section.

## Redis (see prior entry above) and taste-skill pass on the public website
Applied `leonxlnx/taste-skill`'s redesign protocol (audit first, targeted evolution over full
rewrite, preserve IA/nav/copy voice) to `public-website`:
- **Typography**: swapped the default `Inter` for `Plus Jakarta Sans` (`tailwind.config.js`,
  `index.css`, Google Fonts link in `index.html`) — Inter is explicitly called out as an
  overused LLM default.
- **Color**: replaced the indigo/violet accent (`#6366f1` family) — the skill's other flagged
  default, paired with slate-900, is exactly what this site had — with a teal accent
  (`#0d9488` family) less associated with generic AI-generated SaaS sites. Every hardcoded
  `indigo`/`violet`/`purple` utility class across Hero, CourseCard, InspirationSlider and
  LearningJourney was updated to match.
- **Removed banned patterns ("AI tells")** found on an audit pass: the Hero headline's
  `<br>`-split, gradient-text second line ("Learn Today. / Build Tomorrow.") — rewritten as one
  natural sentence using weight/color for hierarchy instead of a gradient; three rendered
  em-dashes in real user-facing copy (a stats-loading placeholder, a testimonial-slide
  attribution, and a body sentence in the "Learning in Action" section) — em-dash is the skill's
  single most emphasized banned character in visible text.
- **Deliberately left alone**: the 3-column testimonial/course grids. The skill bans generic
  "3 equal feature cards" (marketing claim rows like Fast/Secure/Scalable), which is different
  from a catalog listing of courses or testimonials — changing those layouts would be layout risk
  for no real anti-slop benefit, so they were left as-is.
- **Admin app (frontend) was intentionally not touched.** The taste-skill's own scope (Section 13)
  explicitly excludes dashboards / dense product UI / data tables — it recommends a proper admin
  design system (Fluent UI, Carbon, Radix Themes, etc.) instead of landing-page anti-slop rules.
  Applying this skill's rules there would fight against what a data-heavy admin panel needs
  (density, tables, forms), so the admin UI's earlier Roles & Permissions redesign stands as-is.

## N+1 query fix — Class Reports
`classReportService.getAll`/`getAllRaw` used to call `computeClassAttendance(batchId, date)` once
per row via `Promise.all(rows.map(...))` — 2 extra queries per class report, so a 20-row page fired
~40 extra round trips (and `getAllRaw`, which has no pagination at all, scaled with the entire
table). Replaced with `attachAttendance(reports)`: one `attendance.findMany` and one
`student.findMany` across every batch on the page, matched back to each report in memory by
`batchId + date` (matching on date alone would wrongly credit one batch's attendance to another
batch's report on the same day — caught and fixed before shipping). `getById`/create/update still
use the original single-report `withAttendance` helper, which is fine for one record at a time.
