import { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
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
import { useCreateBatchTask, useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '../hooks/useTasks';
import { useAllStudents } from '../hooks/useStudents';
import { useAllBatches } from '../hooks/useBatches';
import type { StudentTask } from '../types';
import { formatDate } from '../utils/format';

export default function Tasks() {
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useTasks(table.params);
  const { data: students } = useAllStudents();
  const { data: batches } = useAllBatches();

  const createMutation = useCreateTask();
  const createBatchMutation = useCreateBatchTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; task?: StudentTask } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentTask | null>(null);

  function studentName(id: string) {
    const student = students?.find((s) => s.id === id);
    return student ? `${student.name} (${student.studentId})` : 'Unknown student';
  }

  function batchName(id?: string) {
    if (!id) return null;
    return batches?.find((b) => b.id === id)?.batchId;
  }

  const activeStudents = students?.filter((s) => s.status === 'Active') ?? [];

  const columns: Array<DataTableColumn<StudentTask>> = [
    {
      key: 'title',
      header: 'Task',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-text-primary">{row.title}</p>
            {row.batchAssignmentId && (
              <span title="Assigned to whole batch">
                <Users className="h-3.5 w-3.5 text-brand-500" />
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            {row.batchAssignmentId ? `Batch task · ${batchName(row.batchId) ?? '—'}` : studentName(row.studentId)}
          </p>
        </div>
      ),
    },
    { key: 'assignedDate', header: 'Assigned', render: (row) => formatDate(row.assignedDate) },
    { key: 'dueDate', header: 'Due', sortable: true, render: (row) => formatDate(row.dueDate) },
    { key: 'priority', header: 'Priority', render: (row) => <StatusBadge status={row.priority} /> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
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
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Tasks"
        description="Assign tasks to an individual student or to an entire batch at once."
        action={
          <Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            Assign Task
          </Button>
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
          <>
            <Select value={table.filters.status ?? 'all'} onChange={(e) => table.setFilter('status', e.target.value)} className="h-9 w-full sm:w-44">
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Select>
            <Select value={table.filters.priority ?? 'all'} onChange={(e) => table.setFilter('priority', e.target.value)} className="h-9 w-full sm:w-40">
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
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
        emptyTitle="No tasks assigned yet"
        onRowClick={(row) => setDrawerState({ mode: 'edit', task: row })}
      />

      <Drawer open={Boolean(drawerState)} onClose={() => setDrawerState(null)} title={drawerState?.mode === 'edit' ? 'Edit Task' : 'Assign New Task'}>
        {drawerState && (
          <TaskForm
            defaultValues={drawerState.task}
            students={activeStudents}
            batches={batches ?? []}
            isSubmitting={createMutation.isPending || createBatchMutation.isPending || updateMutation.isPending}
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
              createBatchMutation.mutate(values, { onSuccess: () => setDrawerState(null) });
            }}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete task"
        description={
          deleteTarget?.batchAssignmentId
            ? `"${deleteTarget?.title}" was assigned to the whole batch. This will only delete ${studentName(deleteTarget.studentId)}'s copy — other students in the batch keep theirs.`
            : `Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`
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
