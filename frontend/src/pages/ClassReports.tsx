import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { ClassReportForm } from '../features/class-reports/ClassReportForm';
import { useTableState } from '../hooks/useTableState';
import { useClassReports, useCreateClassReport, useDeleteClassReport, useUpdateClassReport } from '../hooks/useClassReports';
import { useAllBatches } from '../hooks/useBatches';
import { useAllEmployees } from '../hooks/useEmployees';

import type { ClassReport } from '../types';
import { formatDate } from '../utils/format';
import { useCan } from '../hooks/usePermission';

export default function ClassReports() {
  const can = useCan();
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useClassReports(table.params);
  const { data: batches } = useAllBatches();
  const { data: employees } = useAllEmployees();
  const trainers = employees?.filter((e) => e.type === 'Trainer') ?? [];

  const createMutation = useCreateClassReport();
  const updateMutation = useUpdateClassReport();
  const deleteMutation = useDeleteClassReport();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; report?: ClassReport } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassReport | null>(null);

  function batchName(id: string) {
    return batches?.find((b) => b.id === id)?.name ?? '—';
  }

  function trainerName(id: string) {
    return employees?.find((e) => e.id === id)?.name ?? '—';
  }

  const columns: Array<DataTableColumn<ClassReport>> = [
    { key: 'date', header: 'Date', sortable: true, render: (row) => formatDate(row.date) },
    { key: 'batchId', header: 'Batch', render: (row) => batchName(row.batchId) },
    { key: 'trainerId', header: 'Trainer', render: (row) => trainerName(row.trainerId) },
    { key: 'topic', header: 'Topic', render: (row) => row.topic },
    { key: 'module', header: 'Module', render: (row) => row.module },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (row) => {
        const summary = (row as ClassReport & { attendance?: { present: number; total: number; marked: boolean } }).attendance;
        return summary?.marked ? (
          <span>
            {summary.present}/{summary.total}
          </span>
        ) : (
          <span className="text-text-muted">Not marked</span>
        );
      },
    },
    { key: 'taskStatus', header: 'Task Status', render: (row) => <StatusBadge status={row.taskStatus} /> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <>{can('classreports:delete') && (
<Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
          aria-label="Delete report"
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
        title="Class / Training Reports"
        description="Trainers log a report after every class session."
        action={
          can('classreports:create') ? (
<Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            New Report
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
        searchPlaceholder="Search by topic, module, description..."
        filters={
          <Select value={table.filters.batchId ?? 'all'} onChange={(e) => table.setFilter('batchId', e.target.value)} className="h-9 w-52">
            <option value="all">All Batches</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
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
        emptyTitle="No class reports yet"
        onRowClick={can('classreports:update') ? (row) => setDrawerState({ mode: 'edit', report: row }) : undefined}
      />

      <Drawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? 'Edit Class Report' : 'New Class Report'}
      >
        {drawerState && (
          <ClassReportForm
            defaultValues={drawerState.report}
            batches={batches ?? []}
            trainers={trainers}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmit={(values) => {
              if (drawerState.mode === 'edit' && drawerState.report) {
                updateMutation.mutate(
                  { id: drawerState.report.id, patch: values },
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
        title="Delete class report"
        description={`Are you sure you want to delete the report for "${deleteTarget?.topic}"? This action cannot be undone.`}
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
