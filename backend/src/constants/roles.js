const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF', // trainers
  COUNSELLOR: 'COUNSELLOR',
  STUDENT: 'STUDENT',
};

/**
 * Roles whose data access is narrowed to "only what's mine" (their own
 * batches / their own leads & students) rather than the whole academy.
 */
const SCOPED_ROLES = [ROLES.STAFF, ROLES.COUNSELLOR];

function isScopedRole(role) {
  return SCOPED_ROLES.includes(role);
}

/**
 * Employee types that get a login account. Developers, designers, video
 * editors and marketing staff are tracked as employees only — they don't
 * use the app, so no credentials are created for them.
 */
const EMPLOYEE_TYPE_TO_ROLE = {
  TRAINER: ROLES.STAFF,
  COUNSELLOR: ROLES.COUNSELLOR,
};

function roleForEmployeeType(type) {
  return EMPLOYEE_TYPE_TO_ROLE[type] || null;
}

const CRUD = ['read', 'create', 'update', 'delete'];
const crud = (module) => CRUD.map((action) => `${module}:${action}`);

/**
 * Modules that used to have a single `<module>:manage` permission and now
 * have separate read / create / update / delete grants. The permissions
 * service expands legacy `:manage` rows in the database into these.
 */
const CRUD_MODULES = ['courses', 'batches', 'walkins', 'tasks', 'performance', 'classreports', 'fees', 'staff'];
const ATTENDANCE_ACTIONS = ['read', 'create', 'update'];

/**
 * The permission matrix defaults. This is the actual security boundary — the
 * frontend also hides buttons/routes for UX, but every request is checked
 * against this map (as edited in the DB by an admin) on the server.
 *
 * `-own` permissions mean the caller may only touch data tied to their own
 * account; the "own-ness" check itself happens in the service/controller.
 */
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'students:read',
    'students:create',
    'students:update',
    'students:delete',
    ...CRUD_MODULES.flatMap(crud),
    ...ATTENDANCE_ACTIONS.map((a) => `attendance:${a}`),
    'academy:manage',
    'branding:manage',
    'permissions:manage',
    'testimonials:manage',
    'faqs:manage',
    'announcements:manage',
    'reports:read',
    'dashboard:read',
    'search:read',
  ],
  // Trainer: read-only on student records (they teach students, they don't
  // manage the student record itself) plus full control of the things that
  // are actually theirs to run day-to-day — attendance, class reports,
  // tasks, performance — all scoped to their own batches (see isScopedRole).
  [ROLES.STAFF]: [
    'students:read',
    'attendance:read',
    'attendance:create',
    'attendance:update',
    ...crud('classreports'),
    ...crud('tasks'),
    ...crud('performance'),
    'batches:read',
    'courses:read',
    'dashboard:read',
    'search:read',
  ],
  // Counsellor: manages registration and walk-ins only — nothing beyond
  // what that job needs (no fees, no batches/attendance management).
  [ROLES.COUNSELLOR]: [
    ...crud('walkins'),
    'students:create',
    'students:update',
    'students:read',
    'courses:read',
    'batches:read',
    'dashboard:read',
    'search:read',
  ],
  [ROLES.STUDENT]: [
    'profile:read-own',
    'attendance:read-own',
    'courses:read-own',
    'fees:read-own',
    'tasks:read-own',
    'performance:read-own',
  ],
};

function roleHasPermission(role, permission) {
  return Boolean(PERMISSIONS[role]?.includes(permission));
}

module.exports = {
  ROLES,
  PERMISSIONS,
  CRUD_MODULES,
  ATTENDANCE_ACTIONS,
  isScopedRole,
  roleForEmployeeType,
  roleHasPermission,
};
