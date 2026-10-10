# AcademyPro — Full-Stack Academy Management System

## Architecture

```
project-root/
├── frontend/       React + TypeScript + Vite admin dashboard
├── public-website/ React + TypeScript + Vite public academy website
├── backend/        Node.js + Express + Prisma + PostgreSQL
└── docker-compose.yml
```

```
Browser
  |  (httpOnly cookies)
React SPA -> Axios client -> Express routes
                                 |
                          auth middleware (JWT)
                                 |
                       permission middleware (RBAC)
                                 |
                            Zod validation
                                 |
                        controller -> service
                                 |
                           Prisma Client
                                 |
                            PostgreSQL
```

The backend is a **modular monolith** — one Express app, organized by
feature (routes -> controllers -> services), not a repository-pattern /
dependency-injection framework. That's deliberate: this app has a clear,
bounded feature set, and extra layers would add indirection without adding
safety.

---

## Getting Started

### Option A — Docker Compose (fastest)

```bash
cp .env.example .env
# Set POSTGRES_PASSWORD to a unique URL-safe value and generate two different
# JWT secrets with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
docker compose up --build
```

This starts Postgres, Redis, the backend (running migrations automatically
on boot), and the admin frontend behind nginx.
The Compose stack is for local development only, binds its ports to localhost,
and refuses to start with empty database or JWT secrets. Do not use it as a
production deployment configuration.

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/health

The public website is currently run separately because it has its own Vite
application and is not included as a Docker Compose service yet. Start it with
the instructions in the [Public Website](#public-website) section.

Then seed demo data once the containers are healthy:

```bash
docker compose exec backend npx prisma db seed
```

### Option B — Run locally

**Requirements:** Node.js 20+, PostgreSQL 16+, Redis (optional but recommended).

```bash
# 1. Backend
cd backend
cp .env.example .env        # set DATABASE_URL and generate both required JWT secrets
npm install
npx prisma migrate deploy   # applies the committed migration
npx prisma generate
npx prisma db seed
npm run dev                 # http://localhost:5000

# 2. Frontend (separate terminal)
cd frontend
cp .env.example .env        # VITE_API_URL should point at the backend above
npm install
npm run dev                 # http://localhost:5173
```

### Public website

The public website is a separate frontend for visitors and prospective
students. It reads public course and batch data from the backend and submits
registration enquiries. It does not use the admin dashboard's authenticated
session or duplicate course data locally.

```bash
cd public-website
npm install

# Optional: create .env if the backend is not at the default URL
# VITE_API_URL=http://localhost:5000/api

npm run dev                 # normally http://localhost:5174 if 5173 is occupied
```

Its main routes are:

| URL | Purpose |
| --- | --- |
| `/` | Public academy home page, course list, FAQ, testimonials, and contact sections |
| `/courses/:id` | Course details and available batches |
| `/register` | Four-step student registration enquiry form |

The public website data flow is:

```text
Public page/component
  -> React Query hook in public-website/src/hooks/
  -> API module in public-website/src/api/
  -> Axios client
  -> backend /api/public/* endpoint
  -> response rendered by the component
```

The public API endpoints used by this app are:

```text
GET  /api/public/courses
GET  /api/public/courses/:id
GET  /api/public/courses/:id/batches
POST /api/public/register
```

For more detail about the public site's folder structure and extension pattern,
see [public-website/README.md](public-website/README.md).

---

## Demo Accounts

Created by the seed script (`backend/prisma/seed.js`):

| Role    | Email                   | Password   |
| ------- | ------------------------ | ---------- |
| Admin   | admin@academypro.com    | admin123   |
| Trainer (Staff) | trainer@academypro.com  | staff123   |
| Counsellor | counsellor@academypro.com | counsellor123 |
| Student | student@academypro.com  | student123 |

---

## Authentication

- **Access token**: short-lived JWT (15 min), sent as an httpOnly cookie.
- **Refresh token**: opaque random string, hashed and stored server-side
  (`refresh_tokens` table), rotated on every use, revocable on logout. Also
  delivered as an httpOnly cookie, scoped to `/api/auth` only.
- The frontend never touches either token directly — Axios sends cookies
  automatically (`withCredentials: true`), and a response interceptor
  (`frontend/src/services/httpClient.ts`) silently calls `/api/auth/refresh`
  exactly once on a 401 before giving up and redirecting to `/login`.
- On every page load the app calls `GET /api/auth/me` to ask the server who
  is actually logged in, rather than trusting stale `localStorage` —
  necessary because the real session lives in a cookie JavaScript can't read.

---

## Roles & Permissions

Permissions are enforced **only** on the backend
(`backend/src/constants/roles.js` + `permissionMiddleware.js`). The frontend
may also hide UI for permissions a role lacks, but that's UX, never security.

| Role    | Can do |
| ------- | ------ |
| ADMIN   | Everything — users, students, staff, courses, batches, fees, attendance, tasks, performance, reports |
| STAFF   | Read/update students, manage attendance/class reports/tasks/performance, read-only on courses/batches |
| STUDENT | Read-only access to **their own** profile, attendance, fees, tasks, and performance — enforced by comparing the authenticated user's linked `studentId` against the record being requested (IDOR protection), not just by role name |

A STUDENT calling `GET /api/students/:id` (or the fees/attendance/tasks/
performance equivalents) for anyone else's ID gets a `403 IDOR_BLOCKED` —
covered by an actual test (`backend/tests/idorProtection.test.js`).

---

## API Overview

```
/api/auth          login, register, refresh, logout, me
/api/users         admin-managed login accounts
/api/students      student CRUD + /me for the logged-in student
/api/employees     staff/trainer CRUD
/api/courses       course catalog CRUD (fee reflected into new admissions)
/api/batches       batch CRUD
/api/walkins       walk-in enquiry CRUD + admission conversion
/api/fees          fee details + payment history, /me for students
/api/attendance    batch-wise marking, per-student history, live class-summary
/api/tasks         individual + whole-batch assignment
/api/performance   evaluations, computed overall score
/api/class-reports linked live to real attendance (no duplicate entry)
/api/dashboard     all admin/student dashboard stats, computed live
/api/search        global search across students/walk-ins/batches/employees
/api/public/courses             public course catalog
/api/public/courses/:id         public course details
/api/public/courses/:id/batches public batches for a course
/api/public/register            public registration enquiry
```

Every list endpoint supports `page`, `pageSize`, `search`, `sortBy`,
`sortDir` query params.

---

## Database

See `backend/prisma/schema.prisma` for the full schema — 13 models with
proper foreign keys, `onDelete` cascade/restrict rules, unique constraints,
and enums. Notable design decisions:

- **Deleting a student cascades** to their fee, attendance, task, and
  performance records automatically at the database level — not
  application code remembering to clean up four tables.
- **Deleting a course used by any student/batch is blocked** (`onDelete:
  Restrict` at the DB level, plus a friendlier check in `courseService.js`
  before that constraint would even fire).
- **Attendance has a unique constraint** on `(studentId, batchId, date)` —
  it is structurally impossible to double-mark the same student twice for
  the same class.
- Course names are dynamic (admin-managed), but the frontend UI still
  speaks in human-readable labels ("Video Editor", "In Progress") rather
  than database casing — translated at the API boundary via
  `backend/src/utils/enumMaps.js` rather than rewriting the whole frontend.

---

## Testing

```bash
cd backend
npm test
```

41 tests covering: the RBAC permission matrix, the permission/role
middleware, IDOR protection, password hashing, JWT/refresh-token utilities,
Zod validators, and a full integration test of the login flow through the
real Express app (routing, cookies, rate limiting, error formatting) with
Prisma mocked at the module boundary.

### A note on Prisma and this development sandbox

While building this, the sandbox this was developed in restricts network
egress to a fixed allowlist that does **not** include
`binaries.prisma.sh` — the CDN Prisma's CLI and client use to download
their native query-engine binary. This meant `prisma migrate dev`,
`prisma generate`, and any live query through `@prisma/client` could not be
executed *in that sandbox specifically*.

This is a constraint of that environment, not of the code: in any normal
environment (your machine, Docker, CI, AWS) with unrestricted internet
access, `npm install && npx prisma generate` works exactly as expected. To
compensate during development:

- The **relational schema was validated for real** — hand-translated to raw
  SQL DDL and applied directly against a live local PostgreSQL instance,
  including inserting real interlinked rows and confirming both a
  `RESTRICT` and a `CASCADE` delete fire correctly.
- All **business and security logic was tested for real** via Jest, with
  Prisma mocked at the module boundary — a legitimate, common pattern
  (unit/integration tests mock the ORM; a separate live-DB test stage runs
  in CI where the engine can actually be downloaded).
- This process caught and fixed three genuine bugs before shipping: an
  `express-rate-limit` v8 IPv6 key-generation crash, an unguarded
  `instanceof` check that crashed the error handler itself, and a Zod v4
  API rename (`.errors` -> `.issues`) that silently broke every validation
  error message.

---

## Environment Variables

See `backend/.env.example`, `frontend/.env.example`, and
`public-website/.env.example`. The root `.env.example` is only for the local
Docker Compose stack. Never commit a real `.env` file; the repository ignore
rules exclude local environment files while keeping the example templates.
Set non-empty, unique JWT secrets in `backend/.env` before starting the backend.
Generate each secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Frontends

This repository contains two separate React applications:

- **`frontend/`** is the authenticated admin and student management dashboard.
  It uses protected routes, httpOnly-cookie authentication, RBAC, and the full
  internal API.
- **`public-website/`** is the unauthenticated public academy website. It uses
  only safe `/api/public/*` endpoints for browsing courses, viewing batches,
  and submitting registration enquiries.

Both applications communicate with the same backend, which remains the source
of truth for courses, batches, leads, and all management data.

## Deploying to AWS

The architecture is deployment-shaped already:

```
Route 53 -> CloudFront -> S3 (frontend and public-website static builds)
                        -> ALB -> ECS/EC2 (backend) -> RDS PostgreSQL
                                                     -> ElastiCache Redis
```

- **Backend**: containerize with the included `backend/Dockerfile`, run on
  ECS Fargate or EC2 behind an ALB.
- **Frontend**: `npm run build` the `frontend/` app and serve the static
  `dist/` output from S3 + CloudFront (the included `Dockerfile`/`nginx.conf`
  are for the Docker Compose path; S3+CloudFront is usually cheaper for a
  pure static SPA).
- **Public website**: run `npm run build` from `public-website/` and publish
  its `dist/` output as a public static site. Set `VITE_API_URL` to the public
  backend URL at build time.
- **Database**: RDS PostgreSQL, `DATABASE_URL` pointed at it, run
  `prisma migrate deploy` (not `migrate dev`) as part of your deploy step.
- **Redis**: ElastiCache, optional but recommended once running more than
  one backend instance (shared rate-limit state).
- **Secrets**: AWS Secrets Manager or Parameter Store, injected as
  environment variables — never baked into the image.
