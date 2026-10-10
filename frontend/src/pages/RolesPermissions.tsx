import { useMemo, useState } from 'react';
import type React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  GraduationCap,
  Headset,
  Loader2,
  Search,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Field';
import { CardSkeleton, ErrorState } from '../components/common/States';
import { permissionsApi, type PermissionGroup } from '../services/permissionsApi';
import { toastError, toastSuccess } from '../store/toastStore';
import { cn } from '../utils/cn';

type Role = 'ADMIN' | 'STAFF' | 'COUNSELLOR' | 'STUDENT';

const ROLE_INFO: Record<Role, { label: string; description: string; icon: LucideIcon; ring: string; tint: string; bar: string }> = {
  ADMIN: {
    label: 'Admin',
    description: 'Full control of the academy — every module, plus roles and branding.',
    icon: ShieldCheck,
    ring: 'ring-violet-500',
    tint: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    bar: 'bg-violet-500',
  },
  STAFF: {
    label: 'Trainer',
    description: 'Runs their own batches — attendance, class reports, tasks and performance.',
    icon: UserCog,
    ring: 'ring-sky-500',
    tint: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    bar: 'bg-sky-500',
  },
  COUNSELLOR: {
    label: 'Counsellor',
    description: 'Handles walk-ins and student registration.',
    icon: Headset,
    ring: 'ring-amber-500',
    tint: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  STUDENT: {
    label: 'Student',
    description: 'Sees only their own profile, fees, attendance, tasks and performance.',
    icon: GraduationCap,
    ring: 'ring-emerald-500',
    tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
};

const ROLE_ORDER: Role[] = ['ADMIN', 'STAFF', 'COUNSELLOR', 'STUDENT'];

const ACTION_LABEL: Record<string, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  manage: 'Manage',
  'read-own': 'View own',
};

const ACTION_TONE: Record<string, string> = {
  read: 'bg-sky-600',
  'read-own': 'bg-teal-600',
  create: 'bg-emerald-600',
  update: 'bg-amber-500',
  delete: 'bg-red-600',
  manage: 'bg-violet-600',
};

function actionOf(key: string): string {
  const suffix = key.split(':')[1] ?? key;
  return ACTION_LABEL[suffix] ? suffix : 'manage';
}

export default function RolesPermissions() {
  const queryClient = useQueryClient();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<Role>('STAFF');
  const [search, setSearch] = useState('');

  const { data: groups, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => permissionsApi.getMatrix(),
  });

  const mutation = useMutation({
    mutationFn: ({ role, permission, enabled }: { role: Role; permission: string; enabled: boolean }) =>
      permissionsApi.update(role, permission, enabled),
    onMutate: ({ role, permission }) => setPendingKey(`${role}:${permission}`),
    onSuccess: (data, { role, permission, enabled }) => {
      queryClient.setQueryData(['admin', 'permissions'], data);
      toastSuccess(`${ROLE_INFO[role].label}: ${enabled ? 'granted' : 'revoked'}`, permission);
    },
    onError: (error: Error) => toastError("Couldn't update permission", error.message),
    onSettled: () => setPendingKey(null),
  });

  const counts = useMemo(() => {
    const result: Record<Role, { on: number; total: number }> = {
      ADMIN: { on: 0, total: 0 },
      STAFF: { on: 0, total: 0 },
      COUNSELLOR: { on: 0, total: 0 },
      STUDENT: { on: 0, total: 0 },
    };
    (groups ?? []).forEach((group: PermissionGroup) => {
      group.permissions.forEach((perm) => {
        ROLE_ORDER.forEach((role) => {
          result[role].total += 1;
          if (perm.roles[role]) result[role].on += 1;
        });
      });
    });
    return result;
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (perm) => group.label.toLowerCase().includes(q) || perm.key.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, search]);

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Pick a role, then turn what it can do on or off. Changes apply immediately across the whole app."
      />

      <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This is the actual security boundary, not just what buttons show up. Turning off something a role depends
          on — like <span className="font-mono">Students → View</span> for Trainer — can break pages for everyone
          with that role.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError || !groups ? (
        <Card>
          <ErrorState onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_ORDER.map((role) => {
              const info = ROLE_INFO[role];
              const Icon = info.icon;
              const { on, total } = counts[role];
              const active = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={cn(
                    'group rounded-2xl border border-border bg-surface p-4 text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    active && `ring-2 ${info.ring}`,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', info.tint)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-text-muted">
                      {on}/{total}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-text-primary">{info.label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">{info.description}</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', info.bar)}
                      style={{ width: total ? `${(on / total) * 100}%` : '0%' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-text-muted" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search a module or permission…"
              className="max-w-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredGroups.map((group) => (
              <Card key={group.label} className="overflow-hidden">
                <div className="border-b border-border px-5 py-3">
                  <h3 className="text-sm font-semibold text-text-primary">{group.label}</h3>
                </div>
                <div className="flex flex-wrap gap-2 p-4">
                  {group.permissions.map((perm) => {
                    const action = actionOf(perm.key);
                    const cellKey = `${activeRole}:${perm.key}`;
                    const isPending = pendingKey === cellKey;
                    const on = Boolean(perm.roles[activeRole]);
                    const locked = activeRole === 'ADMIN' && perm.key === 'permissions:manage';
                    return (
                      <button
                        key={perm.key}
                        type="button"
                        disabled={isPending || locked}
                        title={locked ? "Admin can't lose access to this page" : perm.key}
                        onClick={() => mutation.mutate({ role: activeRole, permission: perm.key, enabled: !on })}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70',
                          on
                            ? cn('border-transparent text-white', ACTION_TONE[action] ?? 'bg-brand-600')
                            : 'border-border bg-surface-muted text-text-secondary hover:bg-surface-hover',
                        )}
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', on ? 'bg-white' : 'bg-text-muted/50')} />
                        )}
                        {ACTION_LABEL[action] ?? action}
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
            {filteredGroups.length === 0 && (
              <Card className="lg:col-span-2">
                <p className="p-6 text-center text-sm text-text-muted">No modules match "{search}".</p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
