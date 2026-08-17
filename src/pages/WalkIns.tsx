import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Plus, Trash2, UserCheck } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { WalkInForm } from '../features/walkins/WalkInForm';
import { useTableState } from '../hooks/useTableState';
import { useCreateWalkIn, useDeleteWalkIn, useUpdateWalkIn, useWalkIns } from '../hooks/useWalkIns';
import { useAllEmployees } from '../hooks/useEmployees';
import { useAllCourses } from '../hooks/useCourses';
import type { WalkIn } from '../types';
import { formatDate } from '../utils/format';

const LEAD_STATUSES = ['New', 'Contacted', 'Counselling', 'Interested', 'Admission', 'Not Interested'];

export default function WalkIns() {
  const navigate = useNavigate();
  const table = useTableState();
  const { data, isLoading, isError, refetch } = useWalkIns(table.params);
  const { data: employees } = useAllEmployees();
  const { data: courses } = useAllCourses();
  const counsellors = employees?.filter((e) => e.type === 'Counsellor') ?? [];

  const createMutation = useCreateWalkIn();
  const updateMutation = useUpdateWalkIn();
  const deleteMutation = useDeleteWalkIn();

  const [drawerState, setDrawerState] = useState<{ mode: 'create' | 'edit'; walkIn?: WalkIn } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WalkIn | null>(null);

  function counsellorName(id: string) {
    return employees?.find((e) => e.id === id)?.name ?? '—';
  }

  const columns: Array<DataTableColumn<WalkIn>> = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-text-muted" />
          {row.mobile}
        </span>
      ),
    },
    { key: 'courseInterested', header: 'Course', render: (row) => row.courseInterested },
    { key: 'source', header: 'Source', render: (row) => row.source },
    { key: 'counsellorId', header: 'Counsellor', render: (row) => counsellorName(row.counsellorId) },
    { key: 'enquiryDate', header: 'Enquiry Date', sortable: true, render: (row) => formatDate(row.enquiryDate) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status !== 'Admission' && row.status !== 'Not Interested' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/registration?walkInId=${row.id}`);
              }}
              title="Register as student"
            >
              <UserCheck className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label="Delete enquiry"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Walk-ins"
        description="Manage enquiries from reception, counsellors, and marketing channels."
        action={
          <Button onClick={() => setDrawerState({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            New Enquiry
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
        searchPlaceholder="Search by name, mobile, email..."
        filters={
          <Select value={table.filters.status ?? 'all'} onChange={(e) => table.setFilter('status', e.target.value)} className="h-9 w-full sm:w-44">
            <option value="all">All Statuses</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
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
        emptyTitle="No walk-in enquiries yet"
        emptyDescription="New enquiries from reception or marketing will appear here."
        onRowClick={(row) => setDrawerState({ mode: 'edit', walkIn: row })}
      />

      <Drawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? 'Edit Enquiry' : 'New Walk-in Enquiry'}
        description="Capture reception or counsellor enquiry details."
      >
        {drawerState && (
          <WalkInForm
            defaultValues={drawerState.walkIn}
            counsellors={counsellors}
            courses={courses ?? []}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => setDrawerState(null)}
            onSubmit={(values) => {
              if (drawerState.mode === 'edit' && drawerState.walkIn) {
                const wasNotAdmission = drawerState.walkIn.status !== 'Admission';
                const nowAdmission = values.status === 'Admission';
                const alreadyConverted = Boolean(drawerState.walkIn.convertedStudentId);

                updateMutation.mutate(
                  { id: drawerState.walkIn.id, patch: values },
                  {
                    onSuccess: () => {
                      setDrawerState(null);
                      // Moving a lead to "Admission" for the first time should
                      // take the counsellor straight into full registration
                      // rather than silently leaving a half-finished record.
                      if (wasNotAdmission && nowAdmission && !alreadyConverted) {
                        navigate(`/registration?walkInId=${drawerState.walkIn!.id}`);
                      }
                    },
                  },
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
        title="Delete enquiry"
        description={
          deleteTarget?.convertedStudentId
            ? `"${deleteTarget?.name}" has already been admitted as a student. Deleting this enquiry will NOT remove the student record — manage that from the Students page instead.`
            : `Are you sure you want to delete the enquiry for "${deleteTarget?.name}"? This action cannot be undone.`
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
