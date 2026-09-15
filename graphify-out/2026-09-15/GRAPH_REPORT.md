# Graph Report - academypro-fullstack-1  (2026-09-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1288 nodes · 3330 edges · 69 communities (63 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 146 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18e3885d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- StudentProfile.tsx
- cn
- AppRoutes.tsx
- frontend/package.json
- index.ts
- feeService.js
- enumMaps.js
- Users.tsx
- attendanceService.js
- authService.js
- taskRoutes.js
- taskService.js
- employeeService.js
- authMiddleware.js
- batchService.js
- env.js
- performanceController.js
- Fees.tsx
- app.js
- authRoutes.js
- userService.js
- compilerOptions
- backend/package.json
- index.js
- dependencies
- ApiError.js
- feeRoutes.js
- seed.js
- authController.js
- studentController.js
- batchRoutes.js
- performanceRoutes.js
- toastError
- courseRoutes.js
- studentService.js
- Students.tsx
- Courses.tsx
- compilerOptions
- classReportService.js
- toastSuccess
- taskController.js
- validateMiddleware.js
- courseService.js
- walkInService.js
- Batches.tsx
- WalkIns.tsx
- ClassReports.tsx
- walkInRoutes.js
- scripts
- batchController.js
- classReportController.js
- courseController.js
- employeeController.js
- asyncHandler.js
- walkInController.js
- employeeRoutes.js
- studentRoutes.js
- userRoutes.js
- userController.js
- errorMiddleware.js
- rateLimitMiddleware.js
- ApiError
- devDependencies
- auth.integration.test.js
- vite-env.d.ts
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `toastSuccess()` - 56 edges
2. `toastError()` - 43 edges
3. `react` - 43 edges
4. `formatDate()` - 42 edges
5. `cn()` - 41 edges
6. `lucide-react` - 35 edges
7. `Button` - 30 edges
8. `useTableState()` - 25 edges
9. `useAllBatches()` - 23 edges
10. `Select` - 22 edges

## Surprising Connections (you probably didn't know these)
- `handleReset()` --calls--> `toastSuccess()`  [EXTRACTED]
  frontend/src/pages/Settings.tsx → frontend/src/store/toastStore.ts
- `onSubmit()` --calls--> `toastSuccess()`  [EXTRACTED]
  frontend/src/pages/Settings.tsx → frontend/src/store/toastStore.ts
- `handleLogout()` --calls--> `toastSuccess()`  [EXTRACTED]
  frontend/src/components/layout/Topbar.tsx → frontend/src/store/toastStore.ts
- `PerformanceFormProps` --references--> `PerformanceRecord`  [EXTRACTED]
  frontend/src/features/performance/PerformanceForm.tsx → frontend/src/types/index.ts
- `ClassReportFormProps` --references--> `ClassReport`  [EXTRACTED]
  frontend/src/features/class-reports/ClassReportForm.tsx → frontend/src/types/index.ts

## Import Cycles
- None detected.

## Communities (69 total, 3 thin omitted)

### Community 0 - "StudentProfile.tsx"
Cohesion: 0.05
Nodes (95): PageHeader(), StatCard(), StatCardProps, toneClasses, CardSkeleton(), EmptyState(), ErrorState(), Badge() (+87 more)

### Community 1 - "cn"
Cohesion: 0.06
Nodes (75): Modal(), ModalProps, sizeClasses, ToastContainer(), VARIANT_STYLES, Button, ButtonProps, ButtonSize (+67 more)

### Community 2 - "AppRoutes.tsx"
Cohesion: 0.06
Nodes (50): App(), queryClient, AppLayout(), GlobalSearch(), GlobalSearchProps, ResultGroup, Sidebar(), SidebarContent() (+42 more)

### Community 3 - "frontend/package.json"
Cohesion: 0.05
Nodes (40): dependencies, axios, @hookform/resolvers, lucide-react, react, react-dom, react-hook-form, react-router-dom (+32 more)

### Community 4 - "index.ts"
Cohesion: 0.06
Nodes (39): attendanceApi, batchCrud, batchesApi, ClassAttendanceSummary, classReportCrud, classReportsApi, courseCrud, employeeCrud (+31 more)

### Community 5 - "feeService.js"
Cohesion: 0.07
Nodes (32): ApiError, asyncHandler, dashboardService, getCourseDistribution, getLeadFunnel, getMyStats, getRevenueSeries, getStats (+24 more)

### Community 6 - "enumMaps.js"
Cohesion: 0.08
Nodes (25): ActiveInactiveMap, ClassReportTaskStatusMap, EmployeeTypeMap, GenderMap, LeadSourceMap, LeadStatusMap, StudentModeMap, StudentStatusMap (+17 more)

### Community 7 - "Users.tsx"
Cohesion: 0.12
Nodes (24): UserForm(), UserFormProps, CreateUserInput, ManagedUser, unwrap(), useCreateUser(), useDeleteUser(), useUpdateUser() (+16 more)

### Community 8 - "attendanceService.js"
Cohesion: 0.11
Nodes (22): ApiError, asyncHandler, attendanceService, getAllRaw, getByBatchAndDate, getByStudent, getClassSummary, getMine (+14 more)

### Community 9 - "authService.js"
Cohesion: 0.15
Nodes (22): ApiError, getCurrentUser(), { hashPassword, comparePassword }, issueSession(), login(), logout(), prisma, refresh() (+14 more)

### Community 10 - "taskRoutes.js"
Cohesion: 0.10
Nodes (20): classReportController, { createClassReportSchema, updateClassReportSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate (+12 more)

### Community 11 - "taskService.js"
Cohesion: 0.12
Nodes (20): ApiError, create(), createBatchTask(), crypto, getAll(), getAllRaw(), getByStudent(), { parsePagination, buildPaginatedResult } (+12 more)

### Community 12 - "employeeService.js"
Cohesion: 0.13
Nodes (18): env, prisma, { PrismaClient }, ApiError, create(), { EmployeeTypeMap, ActiveInactiveMap }, getAllRaw(), getById() (+10 more)

### Community 13 - "authMiddleware.js"
Cohesion: 0.10
Nodes (19): { ACCESS_COOKIE }, ApiError, asyncHandler, prisma, requireAuth, { verifyAccessToken }, attendanceController, express (+11 more)

### Community 14 - "batchService.js"
Cohesion: 0.17
Nodes (18): ApiError, { BatchStatusMap }, create(), getAll(), getAllRaw(), getById(), includeRelations, { parsePagination, buildPaginatedResult } (+10 more)

### Community 15 - "env.js"
Cohesion: 0.11
Nodes (14): env, env, logger, pino, env, logger, Redis, app (+6 more)

### Community 16 - "performanceController.js"
Cohesion: 0.18
Nodes (16): ApiError, asyncHandler, create, getAllRaw, getByStudent, getMine, performanceService, remove (+8 more)

### Community 17 - "Fees.tsx"
Cohesion: 0.16
Nodes (10): useAddPayment(), useAllFees(), useUpdateFee(), useTableState(), Fees(), PAYMENT_FILTERS, feesApi, FeeRecord (+2 more)

### Community 18 - "app.js"
Cohesion: 0.11
Nodes (15): { apiLimiter }, apiRoutes, app, cookieParser, cors, env, errorMiddleware, express (+7 more)

### Community 19 - "authRoutes.js"
Cohesion: 0.14
Nodes (15): authController, express, { loginLimiter }, { loginSchema, registerSchema, updateProfileSchema }, { requireAuth }, router, validate, loginSchema (+7 more)

### Community 20 - "userService.js"
Cohesion: 0.16
Nodes (14): { ActiveInactiveMap }, ApiError, create(), getById(), { hashPassword }, includeLinks, { parsePagination, buildPaginatedResult }, prisma (+6 more)

### Community 21 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 22 - "backend/package.json"
Cohesion: 0.12
Nodes (16): zod, main, name, prisma, seed, private, type, version (+8 more)

### Community 23 - "index.js"
Cohesion: 0.12
Nodes (16): attendanceRoutes, authRoutes, batchRoutes, classReportRoutes, courseRoutes, dashboardRoutes, employeeRoutes, express (+8 more)

### Community 24 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, cookie-parser, cors, dotenv, express, express-rate-limit, helmet (+8 more)

### Community 25 - "ApiError.js"
Cohesion: 0.18
Nodes (10): PERMISSIONS, roleHasPermission(), ROLES, ApiError, requirePermission(), requireRole(), { roleHasPermission }, ApiError (+2 more)

### Community 26 - "feeRoutes.js"
Cohesion: 0.14
Nodes (14): express, feeController, { idParamSchema }, { requireAuth }, { requirePermission }, router, { updateFeeSchema, addPaymentSchema }, validate (+6 more)

### Community 27 - "seed.js"
Cohesion: 0.19
Nodes (14): bcrypt, COURSES, daysAgo(), daysFromNow(), FIRST_NAMES, fullName(), LAST_NAMES, LOCATIONS (+6 more)

### Community 28 - "authController.js"
Cohesion: 0.25
Nodes (13): asyncHandler, authService, login, logout, me, refresh, register, { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } (+5 more)

### Community 29 - "studentController.js"
Cohesion: 0.22
Nodes (13): ApiError, assertCanAccessStudent(), asyncHandler, create, getAll, getAllRaw, getById, getMe (+5 more)

### Community 30 - "batchRoutes.js"
Cohesion: 0.15
Nodes (13): batchController, { createBatchSchema, updateBatchSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate (+5 more)

### Community 31 - "performanceRoutes.js"
Cohesion: 0.15
Nodes (13): { createPerformanceSchema, updatePerformanceSchema }, express, { idParamSchema }, performanceController, { requireAuth }, { requirePermission }, router, validate (+5 more)

### Community 32 - "toastError"
Cohesion: 0.25
Nodes (10): useCreateEmployee(), useDeleteEmployee(), useEmployees(), useUpdateEmployee(), EMPLOYEE_TYPES, Employees(), Toast, toastError() (+2 more)

### Community 33 - "courseRoutes.js"
Cohesion: 0.16
Nodes (12): courseController, { createCourseSchema, updateCourseSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate (+4 more)

### Community 34 - "studentService.js"
Cohesion: 0.23
Nodes (12): ApiError, create(), { GenderMap, StudentModeMap, StudentStatusMap }, getAllRaw(), getById(), { hashPassword }, includeRelations, nextStudentCode() (+4 more)

### Community 35 - "Students.tsx"
Cohesion: 0.23
Nodes (10): DataTable(), DataTableColumn, DataTableProps, TableSkeleton(), useDeleteStudent(), useStudents(), useUpdateStudent(), STATUSES (+2 more)

### Community 36 - "Courses.tsx"
Cohesion: 0.24
Nodes (9): Drawer(), DrawerProps, CourseForm(), useCourses(), useCreateCourse(), useDeleteCourse(), useUpdateCourse(), Courses() (+1 more)

### Community 37 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 38 - "classReportService.js"
Cohesion: 0.24
Nodes (11): ApiError, attendanceService, { ClassReportTaskStatusMap }, create(), getAllRaw(), getById(), { parsePagination, buildPaginatedResult }, prisma (+3 more)

### Community 39 - "toastSuccess"
Cohesion: 0.35
Nodes (9): useCreateBatchTask(), useCreateTask(), useDeleteTask(), useTasks(), useUpdateTask(), onSubmit(), Tasks(), toastSuccess() (+1 more)

### Community 40 - "taskController.js"
Cohesion: 0.29
Nodes (11): ApiError, asyncHandler, create, createBatchTask, getAll, getAllRaw, getByStudent, getMine (+3 more)

### Community 41 - "validateMiddleware.js"
Cohesion: 0.17
Nodes (9): ApiError, { ZodError }, dashboardController, express, { requireAuth }, { requirePermission }, router, validate (+1 more)

### Community 42 - "courseService.js"
Cohesion: 0.27
Nodes (10): ApiError, { CourseStatusMap }, create(), getAll(), getAllRaw(), getById(), { parsePagination, buildPaginatedResult }, prisma (+2 more)

### Community 43 - "walkInService.js"
Cohesion: 0.26
Nodes (10): ApiError, create(), getAllRaw(), getById(), includeRelations, { LeadSourceMap, LeadStatusMap }, { parsePagination, buildPaginatedResult }, prisma (+2 more)

### Community 44 - "Batches.tsx"
Cohesion: 0.30
Nodes (7): ConfirmDialog(), ConfirmDialogProps, useBatches(), useCreateBatch(), useDeleteBatch(), useUpdateBatch(), Batches()

### Community 45 - "WalkIns.tsx"
Cohesion: 0.30
Nodes (8): WalkInForm(), useCreateWalkIn(), useDeleteWalkIn(), useUpdateWalkIn(), useWalkIns(), LEAD_STATUSES, WalkIns(), WalkIn

### Community 46 - "ClassReports.tsx"
Cohesion: 0.32
Nodes (7): queryKeys, useClassReports(), useCreateClassReport(), useDeleteClassReport(), useUpdateClassReport(), ClassReports(), ClassReport

### Community 47 - "walkInRoutes.js"
Cohesion: 0.18
Nodes (10): { createWalkInSchema, updateWalkInSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate, walkInController (+2 more)

### Community 48 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, prisma:deploy, prisma:generate, prisma:migrate, prisma:seed, prisma:studio, start (+1 more)

### Community 49 - "batchController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, batchService, create, getAll, getAllRaw, getById, remove, update

### Community 50 - "classReportController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, classReportService, create, getAll, getAllRaw, getById, remove, update

### Community 51 - "courseController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, courseService, create, getAll, getAllRaw, getById, remove, update

### Community 52 - "employeeController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, create, employeeService, getAll, getAllRaw, getById, remove, update

### Community 53 - "asyncHandler.js"
Cohesion: 0.22
Nodes (4): asyncHandler, search, searchService, prisma

### Community 54 - "walkInController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, create, getAll, getAllRaw, getById, remove, update, walkInService

### Community 55 - "employeeRoutes.js"
Cohesion: 0.22
Nodes (8): { createEmployeeSchema, updateEmployeeSchema }, employeeController, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate

### Community 56 - "studentRoutes.js"
Cohesion: 0.22
Nodes (8): { createStudentSchema, updateStudentSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, studentController, validate

### Community 57 - "userRoutes.js"
Cohesion: 0.22
Nodes (8): { createUserSchema, updateUserSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, userController, validate

### Community 58 - "userController.js"
Cohesion: 0.43
Nodes (7): asyncHandler, create, getAll, getById, remove, update, userService

### Community 59 - "errorMiddleware.js"
Cohesion: 0.29
Nodes (7): ApiError, env, errorMiddleware(), logger, mapPrismaError(), { Prisma }, @prisma/client

### Community 60 - "rateLimitMiddleware.js"
Cohesion: 0.29
Nodes (7): ApiError, apiLimiter, { ipKeyGenerator }, loginLimiter, rateLimit, tooManyRequestsHandler(), express-rate-limit

### Community 62 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, jest, nodemon, pino-pretty, supertest

### Community 63 - "auth.integration.test.js"
Cohesion: 0.40
Nodes (4): app, bcrypt, request, supertest

## Knowledge Gaps
- **518 isolated node(s):** `BadgeTone`, `ReportType`, `Grade`, `StatCardProps`, `Tab` (+513 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 588 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `authMiddleware.js` to `courseRoutes.js`, `validateMiddleware.js`, `taskRoutes.js`, `walkInRoutes.js`, `app.js`, `authRoutes.js`, `index.js`, `backend/package.json`, `employeeRoutes.js`, `studentRoutes.js`, `userRoutes.js`, `feeRoutes.js`, `batchRoutes.js`, `performanceRoutes.js`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `@prisma/client` connect `errorMiddleware.js` to `seed.js`, `employeeService.js`, `backend/package.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `react` connect `StudentProfile.tsx` to `toastError`, `cn`, `AppRoutes.tsx`, `Students.tsx`, `frontend/package.json`, `Courses.tsx`, `toastSuccess`, `Users.tsx`, `Batches.tsx`, `WalkIns.tsx`, `ClassReports.tsx`, `Fees.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `BadgeTone`, `ReportType`, `Grade` to the rest of the system?**
  _518 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StudentProfile.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05244670542635659 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.055445544554455446 - nodes in this community are weakly interconnected._
- **Should `AppRoutes.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06306306306306306 - nodes in this community are weakly interconnected._