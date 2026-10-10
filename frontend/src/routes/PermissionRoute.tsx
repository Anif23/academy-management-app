import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { hasPermission, homeRouteForRole } from '../utils/rolePermissions';

/** Opens the page only if the logged-in user holds at least one of the listed permissions. */
export function PermissionRoute({ anyOf, children }: { anyOf: string[]; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (!hasPermission(user?.permissions, anyOf)) {
    const home = homeRouteForRole(user?.role, user?.permissions);
    // Never redirect to the page we're already denied on (would loop).
    const target = anyOf.length > 0 && window.location.pathname === home ? '/profile' : home;
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
