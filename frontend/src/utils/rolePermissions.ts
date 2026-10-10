import { useAuthStore } from '../store/authStore';

export type Role = 'ADMIN' | 'STAFF' | 'COUNSELLOR' | 'STUDENT';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  STAFF: 'Trainer',
  COUNSELLOR: 'Counsellor',
  STUDENT: 'Student',
};

/**
 * UX only. The backend is the real security boundary — the permission list
 * on the logged-in user comes from the server (`/auth/me`) and reflects the
 * role → permission matrix an admin manages under Roles & Permissions. This
 * just decides what to show so nobody lands on a button or page that can
 * only end in a 403.
 */
export function hasPermission(permissions: string[] | undefined, required: string | string[]): boolean {
  if (!permissions || permissions.length === 0) return false;
  const list = Array.isArray(required) ? required : [required];
  return list.some((p) => permissions.includes(p));
}

export function canAccessRoute(role: string | undefined, allowedRoles: Role[]): boolean {
  return role !== undefined && allowedRoles.some((allowedRole) => allowedRole === role);
}

/** Route → permission(s) needed to open it (any one is enough). Mirrors the backend route guards. */
export const ROUTE_PERMISSIONS: { path: string; anyOf: string[] }[] = [
  { path: '/dashboard', anyOf: ['dashboard:read'] },
  { path: '/my-profile', anyOf: ['profile:read-own'] },
  { path: '/my-tasks', anyOf: ['tasks:read-own'] },
  { path: '/walk-ins', anyOf: ['walkins:read'] },
  { path: '/registration', anyOf: ['walkins:create', 'students:create'] },
  { path: '/fees', anyOf: ['fees:read'] },
  { path: '/students', anyOf: ['students:read'] },
  { path: '/courses', anyOf: ['courses:read'] },
  { path: '/batches', anyOf: ['batches:read'] },
  { path: '/attendance', anyOf: ['attendance:read'] },
  { path: '/class-reports', anyOf: ['classreports:read'] },
  { path: '/tasks', anyOf: ['tasks:read'] },
  { path: '/performance', anyOf: ['performance:read'] },
  { path: '/employees', anyOf: ['staff:read'] },
  { path: '/reports', anyOf: ['reports:read'] },
  { path: '/users', anyOf: ['users:read'] },
  { path: '/roles-permissions', anyOf: ['permissions:manage'] },
  { path: '/academy-settings', anyOf: ['academy:manage', 'branding:manage', 'testimonials:manage', 'faqs:manage', 'announcements:manage'] },
  { path: '/settings', anyOf: ['branding:manage', 'academy:manage'] },
];

export function homeRouteForRole(role: string | undefined, permissions?: string[]): string {
  const perms = permissions ?? useAuthStore.getState().user?.permissions ?? [];
  if (perms.length === 0) return role === 'STUDENT' ? '/my-profile' : '/profile';
  const first = ROUTE_PERMISSIONS.find((r) => r.anyOf.some((p) => perms.includes(p)));
  if (perms.includes('dashboard:read')) return '/dashboard';
  if (perms.includes('profile:read-own')) return '/my-profile';
  return first?.path ?? '/profile';
}
