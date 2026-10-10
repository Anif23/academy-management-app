import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { UserForm } from '../features/users/UserForm';
import { useTableState } from '../hooks/useTableState';
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '../hooks/useUsers';
import type { ManagedUser } from '../hooks/useUsers';
import { formatDate, initials } from '../utils/format';
import { useCan } from '../hooks/usePermission';

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', STAFF: 'Trainer', COUNSELLOR: 'Counsellor', STUDENT: 'Student' };

export default function Users() {
  const can = useCan();
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useUsers(table.params);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; user?: ManagedUser } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const columns: Array<DataTableColumn<ManagedUser>> = [
    {
      key: 'name',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            {initials(row.name)}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (row) => <StatusBadge status={ROLE_LABELS[row.role] ?? row.role} /> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <>{can('users:delete') && (
<Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
          aria-label="Delete user"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
)}</>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Accounts"
        description="Manage login accounts and roles for Admin, Trainer, Counsellor, and Student users."
        action={
          can('users:create') ? (
<Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            New Account
          </Button>
) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search by name or email..."
        page={table.page}
        pageSize={table.pageSize}
        total={data?.total}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyTitle="No user accounts yet"
        onRowClick={can('users:update') ? (row) => setDrawerState({ mode: 'edit', user: row }) : undefined}
      />

      <Drawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? 'Edit User' : 'New User Account'}
        description={drawerState?.mode === 'edit' ? 'Update role, status, or contact details.' : 'Create a login for an Admin, Trainer, Counsellor, or Student.'}
      >
        {drawerState && (
          <UserForm
            defaultValues={drawerState.user}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmitCreate={(values) => createMutation.mutate(values, { onSuccess: () => setDrawerState(null) })}
            onSubmitEdit={(values) => {
              if (!drawerState.user) return;
              updateMutation.mutate({ id: drawerState.user.id, patch: values }, { onSuccess: () => setDrawerState(null) });
            }}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user account"
        description={`Are you sure you want to delete the login for "${deleteTarget?.name}"? This does not delete their student/employee profile, only their ability to log in.`}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
      />
    </div>
  );
}
