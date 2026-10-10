import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCheckedSession = useAuthStore((s) => s.hasCheckedSession);
  const mustChangePassword = useAuthStore((s) => s.user?.mustChangePassword);
  const location = useLocation();

  // Don't redirect to /login based on stale localStorage before we've had a
  // chance to ask the server whether the real (httpOnly-cookie) session is
  // still valid — that check happens once in App.tsx on mount.
  if (!hasCheckedSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // A user with a forced-pending password change can't reach anything else
  // in the app — every protected route funnels here first — until they
  // actually change it.
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}
