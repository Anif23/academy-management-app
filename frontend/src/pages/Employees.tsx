import { useState } from 'react';
import { Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { EmployeeForm } from '../features/employees/EmployeeForm';
import { useTableState } from '../hooks/useTableState';
import { useCreateEmployee, useDeleteEmployee, useEmployees, useUpdateEmployee } from '../hooks/useEmployees';
import { useAllBatches } from '../hooks/useBatches';
import type { Employee } from '../types';
import { formatDate, initials } from '../utils/format';
import { useCan } from '../hooks/usePermission';

const EMPLOYEE_TYPES = ['Trainer', 'Developer', 'Designer', 'Video Editor', 'Digital Marketing', 'Counsellor'];

export default function Employees() {
  const can = useCan();
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useEmployees(table.params);
  const { data: batches } = useAllBatches();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; employee?: Employee } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  function assignedBatches(employee: Employee) {
    return batches?.filter((b) => b.trainerId === employee.id || employee.assignedBatchIds.includes(b.id)) ?? [];
  }

  const columns: Array<DataTableColumn<Employee>> = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            {initials(row.name)}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-muted">{row.employeeId}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (row) => <StatusBadge status={row.type} /> },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-text-muted">
          <p className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {row.email}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {row.phone}
          </p>
        </div>
      ),
    },
    { key: 'batches', header: 'Allocation', render: (row) => `${assignedBatches(row).length} batch(es)` },
    { key: 'joiningDate', header: 'Joined', render: (row) => formatDate(row.joiningDate) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <>{can('staff:delete') && (
<Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
          aria-label="Remove employee"
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
        title="Employees / Trainer Allocation"
        description="Manage trainers, developers, designers, and support staff."
        action={
          can('staff:create') ? (
<Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            Add Employee
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
        searchPlaceholder="Search by name, ID, email..."
        filters={
          <Select value={table.filters.type ?? 'all'} onChange={(e) => table.setFilter('type', e.target.value)} className="h-9 w-48">
            <option value="all">All Types</option>
            {EMPLOYEE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        }
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSortChange={table.toggleSort}
        page={table.page}
        pageSize={table.pageSize}
        total={data?.total}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyTitle="No employees found"
        onRowClick={can('staff:update') ? (row) => setDrawerState({ mode: 'edit', employee: row }) : undefined}
      />

      <Drawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? 'Edit Employee' : 'Add New Employee'}
      >
        {drawerState && (
          <EmployeeForm
            defaultValues={drawerState.employee}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmit={(values) => {
              if (drawerState.mode === 'edit' && drawerState.employee) {
                updateMutation.mutate(
                  { id: drawerState.employee.id, patch: values },
                  { onSuccess: () => setDrawerState(null) },
                );
              } else {
                createMutation.mutate(values, { onSuccess: () => setDrawerState(null) });
              }
            }}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove employee"
        description={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
      />
    </div>
  );
}
