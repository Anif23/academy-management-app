import { useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { CourseForm } from '../features/courses/CourseForm';
import { useTableState } from '../hooks/useTableState';
import { useCourses, useCreateCourse, useDeleteCourse, useUpdateCourse } from '../hooks/useCourses';
import { useAllStudents } from '../hooks/useStudents';
import { useAllBatches } from '../hooks/useBatches';
import type { CourseRecord } from '../types';
import { formatCurrency } from '../utils/format';
import { useCan } from '../hooks/usePermission';

export default function Courses() {
  const can = useCan();
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useCourses(table.params);
  const { data: students } = useAllStudents();
  const { data: batches } = useAllBatches();

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; course?: CourseRecord } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseRecord | null>(null);
  const [deleteError, setDeleteError] = useState('');

  function studentCount(courseName: string) {
    return students?.filter((s) => s.course === courseName).length ?? 0;
  }

  function batchCount(courseName: string) {
    return batches?.filter((b) => b.course === courseName).length ?? 0;
  }

  const columns: Array<DataTableColumn<CourseRecord>> = [
    {
      key: 'name',
      header: 'Course',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-muted">{row.duration}</p>
          </div>
        </div>
      ),
    },
    { key: 'fee', header: 'Course Fee', render: (row) => formatCurrency(row.fee) },
    { key: 'students', header: 'Students Enrolled', render: (row) => studentCount(row.name) },
    { key: 'batches', header: 'Batches', render: (row) => batchCount(row.name) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <>{can('courses:delete') && (
<Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteError('');
            setDeleteTarget(row);
          }}
          aria-label="Delete course"
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
        title="Courses"
        description="Manage the course catalog. Course fees set here are used automatically when a student registers."
        action={
          can('courses:create') ? (
<Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            New Course
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
        searchPlaceholder="Search courses..."
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSortChange={table.toggleSort}
        page={table.page}
        pageSize={table.pageSize}
        total={data?.total}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyTitle="No courses yet"
        emptyDescription="Add your first course to start registering students against it."
        onRowClick={can('courses:update') ? (row) => setDrawerState({ mode: 'edit', course: row }) : undefined}
      />

      <Drawer open={Boolean(drawerState)} onClose={() => setDrawerState(null)} title={drawerState?.mode === 'edit' ? 'Edit Course' : 'New Course'}>
        {drawerState && (
          <CourseForm
            defaultValues={drawerState.course}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmit={(values) => {
              if (drawerState.mode === 'edit' && drawerState.course) {
                updateMutation.mutate(
                  { id: drawerState.course.id, patch: values },
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
        title="Delete course"
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
