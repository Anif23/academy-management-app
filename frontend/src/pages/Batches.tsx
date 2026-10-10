import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { BatchForm } from '../features/batches/BatchForm';
import { useTableState } from '../hooks/useTableState';
import { useBatches, useCreateBatch, useDeleteBatch, useUpdateBatch } from '../hooks/useBatches';
import { useAllEmployees } from '../hooks/useEmployees';
import { useAllCourses } from '../hooks/useCourses';
import type { Batch } from '../types';
import { formatDate } from '../utils/format';
import { useCan } from '../hooks/usePermission';

export default function Batches() {
  const can = useCan();
  const navigate = useNavigate();
  const canCreate = can('batches:create');
  const canUpdate = can('batches:update');
  const canDelete = can('batches:delete');
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useBatches(table.params);
  const { data: employees } = useAllEmployees();
  const { data: courses } = useAllCourses();
  const trainers = employees?.filter((e) => e.type === 'Trainer') ?? [];

  const courseNames = useMemo(() => {
    const names = new Set<string>();
    courses?.forEach((c) => names.add(c.name));
    data?.data.forEach((b) => names.add(b.course));
    return Array.from(names);
  }, [courses, data]);

  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();
  const deleteMutation = useDeleteBatch();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; batch?: Batch } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);
  const [deleteError, setDeleteError] = useState('');

  function trainerName(id: string) {
    return employees?.find((e) => e.id === id)?.name ?? '—';
  }

  const columns: Array<DataTableColumn<Batch>> = [
    {
      key: 'name',
      header: 'Batch',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-muted">{row.batchId}</p>
        </div>
      ),
    },
    { key: 'course', header: 'Course', render: (row) => row.course },
    { key: 'trainerId', header: 'Trainer', render: (row) => trainerName(row.trainerId) },
    {
      key: 'students',
      header: 'Students',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-text-muted" />
          {row.studentIds.length}
        </span>
      ),
    },
    { key: 'startDate', header: 'Start Date', sortable: true, render: (row) => formatDate(row.startDate) },
    { key: 'classTiming', header: 'Timing', render: (row) => row.classTiming },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students?batchId=${row.id}`);
            }}
            aria-label="View students in this batch"
            title="View students in this batch"
          >
            <Eye className="h-4 w-4 text-text-muted" />
          </Button>
          {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDrawerState({ mode: 'edit', batch: row });
                }}
                aria-label="Edit batch"
              >
                <Pencil className="h-4 w-4" />
              </Button>
)}
{canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteError('');
                  setDeleteTarget(row);
                }}
                aria-label="Delete batch"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
)}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Batch Management"
        description={canCreate || canUpdate ? 'Create and manage training batches, schedules, and trainer allocation.' : 'Batches you can view.'}
        action={
          canCreate ? (
            <Button onClick={() => setDrawerState({ mode: 'create' })}>
              <Plus className="h-4 w-4" />
              New Batch
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
        searchPlaceholder="Search by batch name or ID..."
        filters={
          <>
            <Select value={table.filters.course ?? 'all'} onChange={(e) => table.setFilter('course', e.target.value)} className="h-9 w-full sm:w-48">
              <option value="all">All Courses</option>
              {courseNames.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </Select>
            <Select value={table.filters.status ?? 'all'} onChange={(e) => table.setFilter('status', e.target.value)} className="h-9 w-full sm:w-40">
              <option value="all">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </Select>
          </>
        }
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSortChange={table.toggleSort}
        page={table.page}
        pageSize={table.pageSize}
        total={data?.total}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyTitle="No batches created yet"
        onRowClick={(row) => (canUpdate ? setDrawerState({ mode: 'edit', batch: row }) : navigate(`/students?batchId=${row.id}`))}
      />

      <Drawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? 'Edit Batch' : 'Create New Batch'}
        description="Define batch schedule and assign a trainer."
      >
        {drawerState && (
          <BatchForm
            defaultValues={drawerState.batch}
            trainers={trainers}
            courses={courses ?? []}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmit={(values) => {
              if (drawerState.mode === 'edit' && drawerState.batch) {
                updateMutation.mutate(
                  { id: drawerState.batch.id, patch: values },
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
        title="Delete batch"
        description={deleteError || `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
              onError: (error: Error) => setDeleteError(error.message),
            });
          }
        }}
      />
    </div>
  );
}
