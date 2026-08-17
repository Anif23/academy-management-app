import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Drawer } from '../components/common/Drawer';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/Badge';
import { StudentForm } from '../features/students/StudentForm';
import { useTableState } from '../hooks/useTableState';
import { useDeleteStudent, useStudents, useUpdateStudent } from '../hooks/useStudents';
import { useAllBatches } from '../hooks/useBatches';
import { useAllEmployees } from '../hooks/useEmployees';
import { useAllCourses } from '../hooks/useCourses';
import type { Student } from '../types';
import { formatDate, initials } from '../utils/format';

const STATUSES = ['Active', 'On Hold', 'Completed', 'Dropped'];

export default function Students() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const batchIdFilter = searchParams.get('batchId') ?? '';
  const table = useTableState();

  useEffect(() => {
    if (batchIdFilter) table.setFilter('batchId', batchIdFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchIdFilter]);

  const { data, isLoading, isError, refetch } = useStudents(table.params);
  const { data: batches } = useAllBatches();
  const { data: employees } = useAllEmployees();
  const { data: courses } = useAllCourses();
  const counsellors = useMemo(() => employees?.filter((e) => e.type === 'Counsellor') ?? [], [employees]);

  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  function batchName(id: string) {
    return batches?.find((b) => b.id === id)?.batchId ?? '—';
  }

  const courseNames = useMemo(() => {
    const names = new Set<string>();
    courses?.forEach((c) => names.add(c.name));
    data?.data.forEach((s) => names.add(s.course));
    return Array.from(names);
  }, [courses, data]);

  const columns: Array<DataTableColumn<Student>> = [
    {
      key: 'name',
      header: 'Student',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            {row.photo ? <img src={row.photo} alt={row.name} className="h-full w-full object-cover" /> : initials(row.name)}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-muted">{row.studentId}</p>
          </div>
        </div>
      ),
    },
    { key: 'course', header: 'Course', render: (row) => row.course },
    { key: 'batchId', header: 'Batch', render: (row) => batchName(row.batchId) },
    { key: 'mobile', header: 'Mobile', render: (row) => row.mobile },
    { key: 'joiningDate', header: 'Joined', sortable: true, render: (row) => formatDate(row.joiningDate) },
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
              setEditTarget(row);
            }}
            aria-label="Edit student"
          >
            <Pencil className="h-4 w-4 text-text-muted" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label="Delete student"
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
        title="Students"
        description="Browse and manage all registered students."
        action={
          <Button onClick={() => navigate('/registration')}>
            <Plus className="h-4 w-4" />
            Register Student
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
        searchPlaceholder="Search by name, ID, email, mobile..."
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
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
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
        emptyTitle="No students found"
        emptyDescription="Register a student to see them listed here."
        onRowClick={(row) => navigate(`/students/${row.id}`)}
      />

      <Drawer open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Edit Student" description="Update the student's information.">
        {editTarget && (
          <StudentForm
            defaultValues={editTarget}
            courses={courses ?? []}
            batches={batches ?? []}
            counsellors={counsellors}
            showPhotoUpload={false}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditTarget(null)}
            onSubmit={(values) => {
              updateMutation.mutate({ id: editTarget.id, patch: values }, { onSuccess: () => setEditTarget(null) });
            }}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete student"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove their fee, attendance, task, and performance records.`}
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
