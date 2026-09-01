import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { canAccessRoute, homeRouteForRole } from '../utils/rolePermissions';
import type { Role } from '../utils/rolePermissions';

export function RoleRoute({ allowedRoles, children }: { allowedRoles: Role[]; children: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);

  if (!canAccessRoute(role, allowedRoles)) {
    return <Navigate to={homeRouteForRole(role)} replace />;
  }

  return <>{children}</>;
}
