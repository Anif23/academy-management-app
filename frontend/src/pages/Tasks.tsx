import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { TaskForm } from '../features/tasks/TaskForm';
import { useTableState } from '../hooks/useTableState';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '../hooks/useTasks';
import { useAllStudents } from '../hooks/useStudents';
import { useAllBatches } from '../hooks/useBatches';
import type { Task } from '../types';
import { formatDate } from '../utils/format';
import { useCan } from '../hooks/usePermission';

export default function Tasks() {
  const can = useCan();
  const navigate = useNavigate();
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useTasks(table.params);
  const { data: students } = useAllStudents();
  const { data: batches } = useAllBatches();

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; task?: Task } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const activeStudents = students?.filter((s) => s.status === 'Active') ?? [];

  const columns: Array<DataTableColumn<Task>> = [
    {
      key: 'title',
      header: 'Task',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-text-primary">{row.title}</p>
            {row.assignmentType === 'batch' && (
              <span title="Assigned to whole batch">
                <Users className="h-3.5 w-3.5 text-brand-500" />
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            {row.assignmentType === 'batch' ? `Batch · ${row.batch?.name ?? '—'}` : row.submissions[0]?.student?.name ?? '—'}
          </p>
        </div>
      ),
    },
    { key: 'dueDate', header: 'Due', sortable: true, render: (row) => formatDate(row.dueDate) },
    { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    {
      key: 'progress',
      header: 'Submission Progress',
      render: (row) => {
        const { total, submitted, overdue } = row.submissionCounts;
        const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
        return (
          <div className="min-w-[140px]">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>
                {submitted}/{total} submitted
              </span>
              {overdue > 0 && <span className="font-medium text-red-600 dark:text-red-400">{overdue} overdue</span>}
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {can('tasks:update') && (
<Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDrawerState({ mode: 'edit', task: row });
            }}
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </Button>
)}
          {can('tasks:delete') && (
<Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label="Delete task"
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
        title="Tasks"
        description="Assign tasks to an individual student or to an entire batch. Click a task to review submissions."
        action={
          can('tasks:create') ? (
<Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            Assign Task
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
        searchPlaceholder="Search by task title..."
        filters={
          <Select value={table.filters.priority ?? 'all'} onChange={(e) => table.setFilter('priority', e.target.value)} className="h-9 w-full sm:w-40">
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
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
        emptyTitle="No tasks assigned yet"
        onRowClick={(row) => navigate(`/tasks/${row.id}/review`)}
      />

      <Drawer open={Boolean(drawerState)} onClose={() => setDrawerState(null)} title={drawerState?.mode === 'edit' ? 'Edit Task' : 'Assign New Task'}>
        {drawerState && (
          <TaskForm
            defaultValues={drawerState.task}
            students={activeStudents}
            batches={batches ?? []}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmitIndividual={(values) => {
              if (drawerState.mode === 'edit' && drawerState.task) {
                updateMutation.mutate(
                  { id: drawerState.task.id, patch: values },
                  { onSuccess: () => setDrawerState(null) },
                );
              } else {
                createMutation.mutate(values, { onSuccess: () => setDrawerState(null) });
              }
            }}
            onSubmitBatch={(values) => {
              if (drawerState.mode === 'edit' && drawerState.task) {
                updateMutation.mutate(
                  { id: drawerState.task.id, patch: values },
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
        title="Delete task"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" has ${deleteTarget.submissionCounts.total} student submission record(s) — deleting it will permanently delete all of them, including anything already submitted. This cannot be undone.`
            : ''
        }
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
