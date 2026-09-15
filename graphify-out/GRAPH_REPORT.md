# Graph Report - academypro-fullstack-1  (2026-09-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1593 nodes · 3846 edges · 100 communities (89 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 164 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18e3885d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- public-website/src/App.tsx
- classReportService.js
- authRoutes.js
- feeService.js
- react
- frontend/src/types/index.ts
- toastSuccess
- Field.tsx
- batchRoutes.js
- StudentProfile.tsx
- Topbar.tsx
- cn
- AppRoutes.tsx
- Reports.tsx
- authService.js
- enumMaps.js
- public-website/package.json
- ClassReportForm.tsx
- permissionMiddleware.js
- index.js
- @tanstack/react-query
- useUsers.ts
- authMiddleware.js
- employeeService.js
- env.js
- compilerOptions
- performanceController.js
- express
- compilerOptions
- seed.js
- prisma.js
- studentService.js
- compilerOptions
- backend/package.json
- dependencies
- app.js
- ApiError.js
- feeRoutes.js
- Performance.tsx
- useAllBatches
- dependencies
- studentController.js
- classReportRoutes.js
- performanceRoutes.js
- walkInService.js
- Dashboard.tsx
- FeeForm.tsx
- courseRoutes.js
- userRoutes.js
- walkInRoutes.js
- taskService.js
- StudentForm.tsx
- compilerOptions
- adminFaqController.js
- uploadRoutes.js
- validateMiddleware.js
- batchService.js
- userService.js
- publicController.js
- taskController.js
- courseService.js
- dependencies
- devDependencies
- adminAcademyController.js
- asyncHandler.js
- taskRoutes.js
- useTasks.ts
- scripts
- academyService.js
- batchController.js
- courseController.js
- employeeController.js
- walkInController.js
- devDependencies
- frontend/src/hooks/useCourses.ts
- useEmployees.ts
- useWalkIns.ts
- userController.js
- errorMiddleware.js
- TaskForm.tsx
- adminTestimonialController.js
- searchController.js
- adminTestimonialService.js
- auth.integration.test.js
- .oxlintrc.json
- devDependencies
- scripts
- scripts
- GlobalSearch
- useGlobalSearch.ts
- vite
- Profile
- vite-env.d.ts
- frontend/tsconfig.json
- public-website/tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `toastSuccess()` - 61 edges
2. `react` - 53 edges
3. `lucide-react` - 51 edges
4. `toastError()` - 45 edges
5. `formatDate()` - 42 edges
6. `cn()` - 41 edges
7. `Button` - 33 edges
8. `@tanstack/react-query` - 26 edges
9. `useTableState()` - 25 edges
10. `useAllBatches()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `onSubmit()` --calls--> `toastSuccess()`  [EXTRACTED]
  frontend/src/pages/Profile.tsx → frontend/src/store/toastStore.ts
- `BatchFormProps` --references--> `CourseRecord`  [EXTRACTED]
  frontend/src/features/batches/BatchForm.tsx → frontend/src/types/index.ts
- `StudentFormProps` --references--> `Batch`  [EXTRACTED]
  frontend/src/features/students/StudentForm.tsx → frontend/src/types/index.ts
- `TaskFormProps` --references--> `Batch`  [EXTRACTED]
  frontend/src/features/tasks/TaskForm.tsx → frontend/src/types/index.ts
- `StudentFormProps` --references--> `Employee`  [EXTRACTED]
  frontend/src/features/students/StudentForm.tsx → frontend/src/types/index.ts

## Import Cycles
- None detected.

## Communities (100 total, 6 thin omitted)

### Community 0 - "public-website/src/App.tsx"
Cohesion: 0.06
Nodes (44): academyApi, batchApi, api, courseApi, faqApi, registrationApi, testmonialsApi, App() (+36 more)

### Community 1 - "classReportService.js"
Cohesion: 0.06
Nodes (41): ApiError, asyncHandler, attendanceService, getAllRaw, getByBatchAndDate, getByStudent, getClassSummary, getMine (+33 more)

### Community 2 - "authRoutes.js"
Cohesion: 0.06
Nodes (40): asyncHandler, authService, login, logout, me, refresh, register, { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } (+32 more)

### Community 3 - "feeService.js"
Cohesion: 0.07
Nodes (32): ApiError, asyncHandler, dashboardService, getCourseDistribution, getLeadFunnel, getMyStats, getRevenueSeries, getStats (+24 more)

### Community 4 - "react"
Cohesion: 0.20
Nodes (23): ConfirmDialog(), ConfirmDialogProps, DataTable(), DataTableColumn, DataTableProps, Drawer(), DrawerProps, PageHeader() (+15 more)

### Community 5 - "frontend/src/types/index.ts"
Cohesion: 0.06
Nodes (35): useAddPayment(), useUpdateFee(), batchCrud, classReportCrud, courseCrud, employeeCrud, feesApi, performanceApi (+27 more)

### Community 6 - "toastSuccess"
Cohesion: 0.12
Nodes (28): handleLogout(), queryKeys, useMarkBulkAttendance(), useCreateBatch(), useDeleteBatch(), useUpdateBatch(), useCreateClassReport(), useDeleteClassReport() (+20 more)

### Community 7 - "Field.tsx"
Cohesion: 0.11
Nodes (29): FieldError(), FieldProps, FormRow(), Input, Label, SelectProps, Textarea, CourseForm() (+21 more)

### Community 8 - "batchRoutes.js"
Cohesion: 0.07
Nodes (28): batchController, { createBatchSchema, updateBatchSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate (+20 more)

### Community 9 - "StudentProfile.tsx"
Cohesion: 0.16
Nodes (23): EmptyState(), ErrorState(), TableSkeleton(), StudentAttendanceTab(), StudentClassReportsTab(), StudentFeeTab(), StudentOverviewTab(), StudentTasksTab() (+15 more)

### Community 10 - "Topbar.tsx"
Cohesion: 0.13
Nodes (22): App(), queryClient, Sidebar(), SidebarContent(), THEME_OPTIONS, Topbar(), findNavLabel(), NAV_ITEMS (+14 more)

### Community 11 - "cn"
Cohesion: 0.11
Nodes (18): Modal(), ModalProps, sizeClasses, StatCard(), StatCardProps, toneClasses, GlobalSearchProps, ResultGroup (+10 more)

### Community 12 - "AppRoutes.tsx"
Cohesion: 0.15
Nodes (19): AppLayout(), ToastContainer(), VARIANT_STYLES, Login(), onSubmit(), AppRoutes(), HomeRedirect(), ProtectedRoute() (+11 more)

### Community 13 - "Reports.tsx"
Cohesion: 0.15
Nodes (22): FeeForm(), useAllAttendance(), useAllClassReports(), useAllFees(), useAllPerformance(), useAllStudents(), useAllTasks(), Dashboard() (+14 more)

### Community 14 - "authService.js"
Cohesion: 0.16
Nodes (21): ApiError, getCurrentUser(), { hashPassword, comparePassword }, issueSession(), login(), logout(), prisma, refresh() (+13 more)

### Community 15 - "enumMaps.js"
Cohesion: 0.11
Nodes (19): ActiveInactiveMap, EmployeeTypeMap, GenderMap, StudentModeMap, StudentStatusMap, TaskPriorityMap, TaskStatusMap, createEmployeeSchema (+11 more)

### Community 16 - "public-website/package.json"
Cohesion: 0.11
Nodes (22): zod, name, private, type, version, zod, name, private (+14 more)

### Community 17 - "ClassReportForm.tsx"
Cohesion: 0.14
Nodes (17): BatchForm(), BatchFormProps, WEEK_DAYS, ClassReportForm(), ClassReportFormProps, EmployeeFormProps, BatchFormValues, batchSchema (+9 more)

### Community 18 - "permissionMiddleware.js"
Cohesion: 0.11
Nodes (17): PERMISSIONS, roleHasPermission(), ROLES, ApiError, requirePermission(), requireRole(), { roleHasPermission }, dashboardController (+9 more)

### Community 19 - "index.js"
Cohesion: 0.09
Nodes (21): adminAcademyRoutes, adminFaqRoutes, adminTestimonialRoutes, attendanceRoutes, authRoutes, batchRoutes, classReportRoutes, courseRoutes (+13 more)

### Community 20 - "@tanstack/react-query"
Cohesion: 0.15
Nodes (15): Field, AcademySettingsForm(), SettingsFormData, settingsSchema, FAQFormData, FAQManager(), faqSchema, TestimonialFormData (+7 more)

### Community 21 - "useUsers.ts"
Cohesion: 0.16
Nodes (18): CreateUserInput, unwrap(), useCreateUser(), useDeleteUser(), useUpdateUser(), useUsers(), Users(), createHttpCrudService() (+10 more)

### Community 22 - "authMiddleware.js"
Cohesion: 0.10
Nodes (18): { ACCESS_COOKIE }, ApiError, asyncHandler, prisma, requireAuth, { verifyAccessToken }, attendanceController, express (+10 more)

### Community 23 - "employeeService.js"
Cohesion: 0.16
Nodes (17): getAll(), ApiError, create(), { EmployeeTypeMap, ActiveInactiveMap }, getAll(), getAllRaw(), getById(), { hashPassword } (+9 more)

### Community 24 - "env.js"
Cohesion: 0.11
Nodes (14): env, env, logger, pino, env, logger, Redis, app (+6 more)

### Community 25 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 26 - "performanceController.js"
Cohesion: 0.18
Nodes (16): ApiError, asyncHandler, create, getAllRaw, getByStudent, getMine, performanceService, remove (+8 more)

### Community 27 - "express"
Cohesion: 0.11
Nodes (16): adminAcademyController, express, { requireAuth }, { requirePermission }, router, adminFaqController, express, { requireAuth } (+8 more)

### Community 28 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, isolatedModules, jsx, lib, module (+9 more)

### Community 29 - "seed.js"
Cohesion: 0.18
Nodes (16): bcrypt, COURSES, daysAgo(), daysFromNow(), FIRST_NAMES, fullName(), LAST_NAMES, LOCATIONS (+8 more)

### Community 30 - "prisma.js"
Cohesion: 0.12
Nodes (11): prisma, env, prisma, { PrismaClient }, ApiError, create(), prisma, { comparePassword } (+3 more)

### Community 31 - "studentService.js"
Cohesion: 0.20
Nodes (14): ApiError, create(), { GenderMap, StudentModeMap, StudentStatusMap }, getAll(), getAllRaw(), getById(), { hashPassword }, includeRelations (+6 more)

### Community 32 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 33 - "backend/package.json"
Cohesion: 0.12
Nodes (15): zod, main, name, prisma, seed, private, type, version (+7 more)

### Community 34 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, cookie-parser, cors, dotenv, express, express-rate-limit, helmet (+8 more)

### Community 35 - "app.js"
Cohesion: 0.12
Nodes (15): { apiLimiter }, apiRoutes, app, cookieParser, cors, env, errorMiddleware, express (+7 more)

### Community 36 - "ApiError.js"
Cohesion: 0.13
Nodes (5): ApiError, ApiError, create(), prisma, ApiError

### Community 37 - "feeRoutes.js"
Cohesion: 0.14
Nodes (14): express, feeController, { idParamSchema }, { requireAuth }, { requirePermission }, router, { updateFeeSchema, addPaymentSchema }, validate (+6 more)

### Community 38 - "Performance.tsx"
Cohesion: 0.22
Nodes (11): Badge(), BadgeTone, STATUS_TONE_MAP, toneClasses, StudentPerformanceTab(), Performance(), SKILL_LABELS, computeOverallPerformance() (+3 more)

### Community 39 - "useAllBatches"
Cohesion: 0.19
Nodes (11): useAllBatches(), useBatches(), useClassReports(), useAllCourses(), useAllEmployees(), useStudents(), useWalkIn(), Batches() (+3 more)

### Community 40 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, axios, clsx, gsap, @gsap/react, @hookform/resolvers, lucide-react, react (+8 more)

### Community 41 - "studentController.js"
Cohesion: 0.22
Nodes (13): ApiError, assertCanAccessStudent(), asyncHandler, create, getAll, getAllRaw, getById, getMe (+5 more)

### Community 42 - "classReportRoutes.js"
Cohesion: 0.15
Nodes (13): classReportController, { createClassReportSchema, updateClassReportSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate (+5 more)

### Community 43 - "performanceRoutes.js"
Cohesion: 0.15
Nodes (13): { createPerformanceSchema, updatePerformanceSchema }, express, { idParamSchema }, performanceController, { requireAuth }, { requirePermission }, router, validate (+5 more)

### Community 44 - "walkInService.js"
Cohesion: 0.20
Nodes (13): ApiError, create(), getAll(), getAllRaw(), getById(), includeRelations, { LeadSourceMap, LeadStatusMap }, { parsePagination, buildPaginatedResult } (+5 more)

### Community 45 - "Dashboard.tsx"
Cohesion: 0.25
Nodes (13): CardSkeleton(), useCourseDistribution(), useDashboardStats(), useLeadFunnel(), useRevenueSeries(), PIE_COLORS, TASK_STATUS_COLORS, getCourseDistribution() (+5 more)

### Community 46 - "FeeForm.tsx"
Cohesion: 0.21
Nodes (12): EmployeeForm(), FeeFormProps, PerformanceForm(), StudentForm(), buildDefaults(), TaskForm(), FeeDetailsFormValues, feeDetailsSchema (+4 more)

### Community 47 - "courseRoutes.js"
Cohesion: 0.16
Nodes (12): courseController, { createCourseSchema, updateCourseSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate (+4 more)

### Community 48 - "userRoutes.js"
Cohesion: 0.16
Nodes (12): { createUserSchema, updateUserSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, userController, validate (+4 more)

### Community 49 - "walkInRoutes.js"
Cohesion: 0.16
Nodes (12): { createWalkInSchema, updateWalkInSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, validate, walkInController (+4 more)

### Community 50 - "taskService.js"
Cohesion: 0.23
Nodes (12): ApiError, create(), createBatchTask(), crypto, getAll(), getAllRaw(), getByStudent(), { parsePagination, buildPaginatedResult } (+4 more)

### Community 51 - "StudentForm.tsx"
Cohesion: 0.24
Nodes (10): PerformanceFormProps, SCORE_FIELDS, StudentFormProps, PerformanceFormValues, performanceSchema, scoreField, StudentFormValues, studentSchema (+2 more)

### Community 52 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 53 - "adminFaqController.js"
Cohesion: 0.23
Nodes (9): asyncHandler, create, faqService, getAll, remove, update, create(), prisma (+1 more)

### Community 54 - "uploadRoutes.js"
Cohesion: 0.18
Nodes (11): fs, multer, path, storage, upload, uploadFile(), express, { requireAuth } (+3 more)

### Community 55 - "validateMiddleware.js"
Cohesion: 0.15
Nodes (10): ApiError, { ZodError }, academyController, express, faqController, { idParamSchema }, publicController, router (+2 more)

### Community 56 - "batchService.js"
Cohesion: 0.26
Nodes (12): ApiError, { BatchStatusMap }, create(), getAll(), getAllRaw(), getByCourseId(), getById(), includeRelations (+4 more)

### Community 57 - "userService.js"
Cohesion: 0.23
Nodes (11): { ActiveInactiveMap }, ApiError, create(), getAll(), getById(), { hashPassword }, includeLinks, { parsePagination, buildPaginatedResult } (+3 more)

### Community 58 - "publicController.js"
Cohesion: 0.17
Nodes (11): ApiError, asyncHandler, batchService, courseService, getAcademyInfo, getBatchesByCourse, getCourseById, getCourses (+3 more)

### Community 59 - "taskController.js"
Cohesion: 0.29
Nodes (11): ApiError, asyncHandler, create, createBatchTask, getAll, getAllRaw, getByStudent, getMine (+3 more)

### Community 60 - "courseService.js"
Cohesion: 0.27
Nodes (10): ApiError, { CourseStatusMap }, create(), getAll(), getAllRaw(), getById(), { parsePagination, buildPaginatedResult }, prisma (+2 more)

### Community 61 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, axios, @hookform/resolvers, lucide-react, react, react-dom, react-hook-form, react-router-dom (+4 more)

### Community 62 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+3 more)

### Community 63 - "adminAcademyController.js"
Cohesion: 0.24
Nodes (6): adminAcademyService, asyncHandler, getSettings, updateSettings, ApiError, prisma

### Community 64 - "asyncHandler.js"
Cohesion: 0.20
Nodes (6): asyncHandler, faqService, getFAQs, asyncHandler, getTestimonials, testimonialService

### Community 65 - "taskRoutes.js"
Cohesion: 0.20
Nodes (9): { createTaskSchema, createBatchTaskSchema, updateTaskSchema }, express, { paginationQuerySchema, idParamSchema }, { requireAuth }, { requirePermission }, router, taskController, validate (+1 more)

### Community 66 - "useTasks.ts"
Cohesion: 0.29
Nodes (7): useCreateBatchTask(), useCreateTask(), useDeleteTask(), useTasks(), useUpdateTask(), Tasks(), tasksApi

### Community 67 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, prisma:deploy, prisma:generate, prisma:migrate, prisma:seed, prisma:studio, start (+1 more)

### Community 68 - "academyService.js"
Cohesion: 0.22
Nodes (5): academyService, asyncHandler, getAcademyInfo, ApiError, prisma

### Community 69 - "batchController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, batchService, create, getAll, getAllRaw, getById, remove, update

### Community 70 - "courseController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, courseService, create, getAll, getAllRaw, getById, remove, update

### Community 71 - "employeeController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, create, employeeService, getAll, getAllRaw, getById, remove, update

### Community 72 - "walkInController.js"
Cohesion: 0.39
Nodes (8): asyncHandler, create, getAll, getAllRaw, getById, remove, update, walkInService

### Community 73 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript, vite (+1 more)

### Community 74 - "frontend/src/hooks/useCourses.ts"
Cohesion: 0.31
Nodes (6): useCourses(), useCreateCourse(), useDeleteCourse(), useUpdateCourse(), Courses(), coursesApi

### Community 75 - "useEmployees.ts"
Cohesion: 0.31
Nodes (6): useCreateEmployee(), useDeleteEmployee(), useEmployees(), useUpdateEmployee(), Employees(), employeesApi

### Community 76 - "useWalkIns.ts"
Cohesion: 0.31
Nodes (6): useCreateWalkIn(), useDeleteWalkIn(), useUpdateWalkIn(), useWalkIns(), WalkIns(), walkInsApi

### Community 77 - "userController.js"
Cohesion: 0.43
Nodes (7): asyncHandler, create, getAll, getById, remove, update, userService

### Community 78 - "errorMiddleware.js"
Cohesion: 0.29
Nodes (7): ApiError, env, errorMiddleware(), logger, mapPrismaError(), { Prisma }, @prisma/client

### Community 79 - "TaskForm.tsx"
Cohesion: 0.50
Nodes (6): TaskFormProps, BatchTaskFormValues, batchTaskSchema, TaskFormValues, taskSchema, StudentTask

### Community 80 - "adminTestimonialController.js"
Cohesion: 0.48
Nodes (6): asyncHandler, create, getAll, remove, testimonialService, update

### Community 81 - "searchController.js"
Cohesion: 0.29
Nodes (4): asyncHandler, search, searchService, prisma

### Community 82 - "adminTestimonialService.js"
Cohesion: 0.47
Nodes (3): create(), prisma, update()

### Community 83 - "auth.integration.test.js"
Cohesion: 0.33
Nodes (5): app, bcrypt, request, bcryptjs, supertest

### Community 84 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 85 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, jest, nodemon, pino-pretty, supertest

### Community 86 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 87 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 89 - "useGlobalSearch.ts"
Cohesion: 0.83
Nodes (3): useDebouncedValue(), useGlobalSearch(), globalSearch()

## Knowledge Gaps
- **673 isolated node(s):** `WhatsAppButtonProps`, `RegistrationFormData`, `Testimonial`, `ThemeMode`, `ThemeState` (+668 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 759 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `express` to `backend/package.json`, `authRoutes.js`, `app.js`, `taskRoutes.js`, `feeRoutes.js`, `batchRoutes.js`, `classReportRoutes.js`, `performanceRoutes.js`, `courseRoutes.js`, `userRoutes.js`, `walkInRoutes.js`, `permissionMiddleware.js`, `index.js`, `authMiddleware.js`, `validateMiddleware.js`, `uploadRoutes.js`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `react` to `public-website/src/App.tsx`, `Performance.tsx`, `Field.tsx`, `StudentProfile.tsx`, `Topbar.tsx`, `cn`, `AppRoutes.tsx`, `Dashboard.tsx`, `FeeForm.tsx`, `TaskForm.tsx`, `public-website/package.json`, `ClassReportForm.tsx`, `Reports.tsx`, `@tanstack/react-query`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `public-website/src/App.tsx`, `Performance.tsx`, `Field.tsx`, `useAllBatches`, `StudentProfile.tsx`, `Topbar.tsx`, `cn`, `AppRoutes.tsx`, `Dashboard.tsx`, `FeeForm.tsx`, `TaskForm.tsx`, `public-website/package.json`, `ClassReportForm.tsx`, `Reports.tsx`, `StudentForm.tsx`, `@tanstack/react-query`, `useGlobalSearch.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `WhatsAppButtonProps`, `RegistrationFormData`, `Testimonial` to the rest of the system?**
  _673 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `public-website/src/App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058496853017400964 - nodes in this community are weakly interconnected._
- **Should `classReportService.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06205673758865248 - nodes in this community are weakly interconnected._
- **Should `authRoutes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.060129509713228495 - nodes in this community are weakly interconnected._