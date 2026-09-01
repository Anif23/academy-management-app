export type Role = 'ADMIN' | 'STAFF' | 'STUDENT';

/**
 * Mirrors backend/src/constants/roles.js — but this copy is UX only. The
 * backend is the real security boundary; this just decides what to show
 * so a user never lands on a page that can only error out for their role.
 */
export function homeRouteForRole(role: string | undefined): string {
  if (role === 'STUDENT') return '/my-profile';
  return '/dashboard';
}

export function canAccessRoute(role: string | undefined, allowedRoles: Role[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role as Role);
}
