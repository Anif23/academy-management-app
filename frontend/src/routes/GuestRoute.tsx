import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { homeRouteForRole } from '../utils/rolePermissions';

/**
 * Inverse of ProtectedRoute: for pages that should only be reachable when
 * the user is NOT logged in (e.g. /login). If a valid session already
 * exists, redirect straight to that user's home page instead of letting
 * them see the login form again.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCheckedSession = useAuthStore((s) => s.hasCheckedSession);
  const role = useAuthStore((s) => s.user?.role);

  // Wait for the initial session check (same rule as ProtectedRoute) so we
  // don't flash the login form for a split second before redirecting.
  if (!hasCheckedSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={homeRouteForRole(role)} replace />;
  }

  return <>{children}</>;
}
