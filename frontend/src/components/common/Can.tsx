import type { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';

interface CanProps {
  /** Show the children if the user has ANY of these permissions. */
  permission: string | string[];
  /** Rendered instead when the user lacks permission (default: nothing). */
  fallback?: ReactNode;
  children: ReactNode;
}

/** `<Can permission="students:create"><Button>Add</Button></Can>` — hides UI the role can't use. */
export function Can({ permission, fallback = null, children }: CanProps) {
  const allowed = usePermission(permission);
  return <>{allowed ? children : fallback}</>;
}
