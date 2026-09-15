const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  STUDENT: 'STUDENT',
};

/**
 * The permission matrix. This is the actual security boundary — the
 * frontend may also hide buttons/routes for UX, but every mutating or
 * data-scoped request is checked against this map on the server.
 *
 * Permissions scoped with "-own" (e.g. "attendance:read-own") mean the
 * caller may only read/write data tied to their own account; enforcing the
 * "own-ness" check itself happens in the relevant service/controller
 * (comparing the authenticated user's linked studentId/employeeId against
 * the record being accessed), not just by having the permission string.
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
    'staff:manage',
    'courses:manage',
    'batches:manage',
    'walkins:manage',
    'fees:manage',
    'attendance:manage',
    'tasks:manage',
    'performance:manage',
    'classreports:manage',
    'academy:manage',
    'testimonials:manage',
    'faqs:manage',
    'reports:read',
    'dashboard:read',
    'search:read',
  ],
  [ROLES.STAFF]: [
    'students:read',
    'students:update',
    'walkins:manage',
    'attendance:read',
    'attendance:create',
    'attendance:update',
    'classreports:manage',
    'tasks:manage',
    'performance:manage',
    'batches:read',
    'courses:read',
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

module.exports = { ROLES, PERMISSIONS, roleHasPermission };
