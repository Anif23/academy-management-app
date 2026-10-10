import { useAuthStore } from '../store/authStore';
import { hasPermission } from '../utils/rolePermissions';

/**
 * usePermission('students:create') → boolean
 * usePermission(['students:update', 'students:delete']) → true if the user has ANY of them.
 */
export function usePermission(required: string | string[]): boolean {
  const permissions = useAuthStore((s) => s.user?.permissions);
  return hasPermission(permissions, required);
}

/** `can('x')` helper for components that check several permissions. */
export function useCan() {
  const permissions = useAuthStore((s) => s.user?.permissions);
  return (required: string | string[]) => hasPermission(permissions, required);
}
