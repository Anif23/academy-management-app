
# AcademyPro Public Website

The public-facing AcademyPro website allows visitors to learn about the academy,
browse courses and available batches, and submit a registration enquiry.

This app is a React + TypeScript + Vite frontend. It does not store course,
batch, or registration data locally. The AcademyPro backend is the source of
truth and exposes public API endpoints for this website.

## How The Code Works

The application starts in `src/main.tsx`:

1. Vite loads the `root` element from `index.html`.
2. React renders `App` inside `StrictMode`.
3. `App.tsx` creates a TanStack Query client and a browser router.
4. The router renders the home page, course details page, or registration page.
5. Shared layout components such as the navbar, WhatsApp button, and footer are
   rendered around every route.

### Main data flow

```text
Page or component
    -> React Query hook in src/hooks/
    -> API module in src/api/
    -> Axios client in src/api/client.ts
    -> AcademyPro backend /api/public/*
    -> typed response returned to the component
```

React Query handles request state and caching. For example, `useCourses()` uses
the `['courses']` query key and calls `courseApi.getAll()`. The API module then
requests `GET /api/public/courses` and returns the backend's `data` property.

## Routes

| URL | Component | Purpose |
| --- | --- | --- |
| `/` | `Home` in `src/App.tsx` | Hero, academy information, courses, testimonials, FAQ, and contact sections |
| `/courses/:id` | `src/pages/CourseDetails.tsx` | Course details and available batches |
| `/register` | `src/pages/Register.tsx` | Multi-step registration form |

Course details links to registration with query parameters such as
`/register?courseId=<id>&batchId=<id>`. The registration page reads these values
and preselects the matching course or batch.

## Course And Batch Requests

The request modules in `src/api/` keep HTTP details out of UI components:

- `courses.ts` calls `GET /api/public/courses` and
  `GET /api/public/courses/:id`.
- `batches.ts` calls `GET /api/public/courses/:courseId/batches`.
- `registrations.ts` calls `POST /api/public/register`.
- `client.ts` creates the shared Axios instance and reads the backend URL from
  `VITE_API_URL`.

Hooks in `src/hooks/` connect these modules to React components:

- `useCourses()` loads the course list.
- `useCourse(id)` loads one course and is disabled until an id exists.
- `useBatches(courseId)` loads batches for the selected course and is disabled
  until a course is selected.

This means the frontend never duplicates course or batch records. Changes made
in the AcademyPro admin system are reflected through the API.

## Registration Flow

`src/pages/Register.tsx` implements a four-step form:

1. Personal details: name, mobile number, and email.
2. Course selection: courses are loaded from the backend.
3. Batch selection: batches are loaded for the selected course.
4. Review and submit: the final form is posted to the backend.

The form uses React Hook Form for field state and submission, Zod for
validation, and `@hookform/resolvers` to connect the two. `form.trigger()`
validates only the fields required for the current step. After a successful
`POST /api/public/register`, the page shows a success state.

## Project Structure

```text
src/
  api/          Axios API modules for courses, batches, FAQs, testimonials, and registration
  components/   Reusable page sections and layout components
  hooks/        TanStack Query hooks that load backend data
  pages/        Route-level pages such as CourseDetails and Register
  types/        Shared TypeScript models and request types
  utils/        Small shared helpers such as className utilities
  App.tsx       Query client, router, routes, shared layout, and home page composition
  main.tsx      React application entry point
  index.css     Global styles and Tailwind layers
```

## Local Setup

Requirements: Node.js 20+ and a running AcademyPro backend.

```bash
cd public-website
npm install
```

Create `public-website/.env` when the backend is not running at the default
URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The website is normally available at `http://localhost:5173`.

## Available Commands

```bash
npm run dev       # Start Vite with hot reload
npm run build     # Run TypeScript build checks and create dist/
npm run lint      # Run Oxlint
npm run preview   # Serve the production build locally
```

## Adding A New API-Driven Feature

Follow the existing flow rather than calling Axios directly from a component:

1. Add or update the response/request type in `src/types/`.
2. Add an API method in the relevant file under `src/api/`.
3. Create a React Query hook under `src/hooks/` with a stable query key.
4. Use the hook from a page or component and handle loading, error, and empty
   states.
5. Add a route in `src/App.tsx` if the feature needs its own URL.

For a new form, keep validation in the page or a nearby schema, use
React Hook Form for submission state, and send the final payload through an API
module.

## Backend Relationship

The public website is the presentation layer only. Public endpoints are defined
in the backend project under `backend/src/` and should expose only safe public
fields. The backend continues to own validation, database access, and lead
creation. To run the complete system, start the backend first and then start
this Vite application.
