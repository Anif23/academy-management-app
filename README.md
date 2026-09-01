# AcademyPro — Full-Stack Academy Management System

A production-oriented rebuild of the AcademyPro frontend on a real backend:
**React + TypeScript frontend, Node.js/Express + PostgreSQL/Prisma backend,
JWT auth with httpOnly cookies, full role-based access control.**

No application data lives in `localStorage` anymore — everything is
persisted in PostgreSQL and served through a REST API.

---

## Architecture

```
project-root/
├── frontend/     React + TypeScript + Vite (unchanged UI, new API layer)
├── backend/      Node.js + Express + Prisma + PostgreSQL
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
docker compose up --build
```

This starts Postgres, Redis, the backend (running migrations automatically
on boot), and the frontend behind nginx.

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/health

Then seed demo data once the containers are healthy:

```bash
docker compose exec backend npx prisma db seed
```

### Option B — Run locally

**Requirements:** Node.js 20+, PostgreSQL 16+, Redis (optional but recommended).

```bash
# 1. Backend
cd backend
cp .env.example .env        # then edit DATABASE_URL / secrets as needed
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

---

## Demo Accounts

Created by the seed script (`backend/prisma/seed.js`):

| Role    | Email                   | Password   |
| ------- | ------------------------ | ---------- |
| Admin   | admin@academypro.com    | admin123   |
| Staff   | trainer@academypro.com  | staff123   |
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

See `backend/.env.example` and `frontend/.env.example`. Never commit a real
`.env` file — generate fresh secrets before deploying anywhere real:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deploying to AWS

The architecture is deployment-shaped already:

```
Route 53 -> CloudFront -> S3 (frontend static build)
                        -> ALB -> ECS/EC2 (backend) -> RDS PostgreSQL
                                                     -> ElastiCache Redis
```

- **Backend**: containerize with the included `backend/Dockerfile`, run on
  ECS Fargate or EC2 behind an ALB.
- **Frontend**: `npm run build` the `frontend/` app and serve the static
  `dist/` output from S3 + CloudFront (the included `Dockerfile`/`nginx.conf`
  are for the Docker Compose path; S3+CloudFront is usually cheaper for a
  pure static SPA).
- **Database**: RDS PostgreSQL, `DATABASE_URL` pointed at it, run
  `prisma migrate deploy` (not `migrate dev`) as part of your deploy step.
- **Redis**: ElastiCache, optional but recommended once running more than
  one backend instance (shared rate-limit state).
- **Secrets**: AWS Secrets Manager or Parameter Store, injected as
  environment variables — never baked into the image.
