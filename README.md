# Acadmey — Student Registration & Report Management System

A professional, frontend-only admin dashboard for managing the complete student
journey at an academy/institute:

**Walk-in → Registration → Admission → Fee Details → Batch Allocation →
Employee/Trainer Allocation → Class Reports → Student Progress → Final Report**

Built for the Iunoware Developer interview assignment.

---

## Live Demo Credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@acadmey.com` |
| Password | `admin123`             |

---

## Technology Stack

| Concern               | Choice                                    |
| ---------------------- | ------------------------------------------ |
| Framework               | React 18 + TypeScript + Vite               |
| Styling                 | Tailwind CSS (CSS-variable design tokens)  |
| Routing                 | React Router v6                            |
| Server-state / cache    | TanStack Query v5                          |
| Forms & validation      | React Hook Form + Zod                      |
| Charts                  | Recharts                                   |
| Icons                   | lucide-react                               |
| Global UI state         | Zustand (auth, theme, toasts, UI)          |
| Persistence             | Browser `localStorage` (mock API layer)    |

No real backend (Node/Express/Mongo/Postgres/Prisma) is used — as required by
the assignment, all data lives in a mock API layer backed by `localStorage`,
seeded with realistic interlinked demo data on first load.

---

## Getting Started

```bash
npm install
npm run dev  
```

The app seeds ~48 students, 8 batches, 13 employees, 26 walk-in leads, fee
records, attendance history, class reports, tasks, and performance
evaluations into `localStorage` on first load. All CRUD changes persist
across reloads. Data is stored under the `acadmey:v1:*` localStorage keys
if you ever want to inspect or clear it manually.

---

## Architecture

```
src/
  components/
    ui/          Base primitives: Button, Input, Select, Badge, Card, Checkbox...
    common/       Reusable composed components: DataTable, Modal, Drawer,
                  ConfirmDialog, PageHeader, StatCard, loading/error/empty states
    layout/       AppLayout, Sidebar, Topbar, GlobalSearch, ToastContainer

  features/       Feature-scoped form components (one folder per module)
    walkins/ students/ batches/ employees/ fees/
    class-reports/ tasks/ performance/

  pages/          One top-level page component per route
  routes/         AppRoutes, ProtectedRoute, sidebar nav config
  hooks/          TanStack Query hooks per entity + shared table-state hook
  schemas/        Zod validation schemas per form
  services/       Mock API layer (CRUD factory, per-entity services, auth)
  store/          Zustand stores: auth, theme, toast, UI
  mock/           Seed data generator (interlinked, deterministic)
  types/          Shared domain types
  utils/          Formatting, className helpers
```

### Data flow

```
Component → TanStack Query hook → Service/API layer → localStorage
```

Every entity (students, walk-ins, batches, employees, fees, attendance,
class reports, tasks, performance) has a full CRUD service built on a shared
`createCrudService` factory, with simulated network delay so loading states
are demonstrable. Mutations invalidate the relevant query keys, update the
UI immediately, and show a toast — success or error.

---

## Assignment Requirements Implemented

- **Module 1 — Student Walk-in**: full enquiry form, lead-status flow
  (New → Contacted → Counselling → Interested → Admission/Not Interested),
  convert-to-student action.
- **Module 2 — Student Registration**: full registration form incl. photo
  upload/preview, auto-generated Student ID (`STU-2026-00125` format).
- **Module 3 — Admission & Fee**: course fee, discount, computed final fee,
  paid/pending amounts, payment history, next-payment tracking.
- **Module 4 — Batch Management**: batch CRUD with trainer, schedule, days,
  linked student roster.
- **Module 5 — Employee/Trainer Allocation**: all 6 employee types, batch
  allocation.
- **Module 6 — Student Dashboard**: per-student progress, attendance,
  classes completed/pending, fee snapshot.
- **Module 7 — Class/Training Report**: full report form linked to
  batch + trainer.
- **Module 8 — Student Individual Report**: tabbed 360° profile
  (Registration → Course → Batch → Attendance → Class Reports → Tasks →
  Performance → Fees).
- **Module 9 — Student Tasks**: task CRUD with priority, status, trainer
  remarks.
- **Module 10 — Student Performance**: 6-parameter evaluation with radar
  chart and computed overall score.
- **Module 11 — Attendance**: batch + date based bulk marking, computed
  percentage, full history.
- **Module 12 — Main Admin Dashboard**: stat cards, revenue trend, course
  distribution, lead funnel, recent class reports — all from real mock data.

### Cross-cutting requirements

- Mock authentication with protected routes and persisted session.
- Global search across students, walk-ins, batches, and employees with
  grouped, debounced, keyboard-friendly results that navigate correctly.
- Light/dark/system theme, applied consistently across every surface,
  persisted across reloads.
- Responsive layout: fixed sidebar on desktop, drawer on mobile; tables
  scroll horizontally rather than breaking.
- Every table: search, filter, sort, pagination, loading skeleton, error
  state, empty state.
- Every form: React Hook Form + Zod validation, inline errors, loading/submit
  states.
- Every mutation: toast feedback, immediate cache invalidation.
- Entity relationships are real and linked (Student ↔ Batch ↔ Trainer ↔ Fees
  ↔ Attendance ↔ Tasks ↔ Performance ↔ Class Reports); batches with students
  cannot be deleted.

---
