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
