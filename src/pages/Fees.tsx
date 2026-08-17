import { useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/ui/Field';
import { FeeForm } from '../features/fees/FeeForm';
import { useAllFees, useAddPayment, useUpdateFee } from '../hooks/useFees';
import { useAllStudents } from '../hooks/useStudents';
import { computeFeeSummary } from '../services/api';
import { useTableState } from '../hooks/useTableState';
import type { FeeRecord } from '../types';
import { formatCurrency, formatDate, initials } from '../utils/format';

const PAYMENT_FILTERS = ['Pending', 'Fully Paid'];

export default function Fees() {
  const table = useTableState();
  const { data: fees, isLoading, isError, refetch } = useAllFees();
  const { data: students } = useAllStudents();
  const updateMutation = useUpdateFee();
  const addPaymentMutation = useAddPayment();
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  function studentFor(fee: FeeRecord) {
    return students?.find((s) => s.id === fee.studentId);
  }

  const filtered = useMemo(() => {
    let rows = fees ?? [];
    if (table.search) {
      const q = table.search.toLowerCase();
      rows = rows.filter((fee) => {
        const student = studentFor(fee);
        return student && [student.name, student.studentId, student.email].some((f) => f.toLowerCase().includes(q));
      });
    }
    if (table.filters.payment && table.filters.payment !== 'all') {
      rows = rows.filter((fee) => {
        const summary = computeFeeSummary(fee);
        return table.filters.payment === 'Pending' ? summary.pendingAmount > 0 : summary.pendingAmount === 0;
      });
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fees, students, table.search, table.filters]);

  const columns: Array<DataTableColumn<FeeRecord>> = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => {
        const student = studentFor(row);
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {student ? initials(student.name) : '—'}
            </div>
            <div>
              <p className="font-medium text-text-primary">{student?.name ?? 'Unknown student'}</p>
              <p className="text-xs text-text-muted">{student?.studentId}</p>
            </div>
          </div>
        );
      },
    },
    { key: 'courseFee', header: 'Course Fee', render: (row) => formatCurrency(row.courseFee) },
    { key: 'finalFee', header: 'Final Fee', render: (row) => formatCurrency(computeFeeSummary(row).finalFee) },
    { key: 'paid', header: 'Paid', render: (row) => <span className="text-emerald-600">{formatCurrency(computeFeeSummary(row).paidAmount)}</span> },
    { key: 'pending', header: 'Pending', render: (row) => <span className="text-red-500">{formatCurrency(computeFeeSummary(row).pendingAmount)}</span> },
    { key: 'nextPaymentDate', header: 'Next Due', render: (row) => (row.nextPaymentDate ? formatDate(row.nextPaymentDate) : '—') },
  ];

  return (
    <div>
      <PageHeader title="Admission &amp; Fees" description="Track course fees, discounts, payments, and dues per student." />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search by student name or ID..."
        filters={
          <Select value={table.filters.payment ?? 'all'} onChange={(e) => table.setFilter('payment', e.target.value)} className="h-9 w-40">
            <option value="all">All Payments</option>
            {PAYMENT_FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        }
        page={1}
        pageSize={filtered.length || 1}
        total={filtered.length}
        emptyTitle="No fee records found"
        onRowClick={(row) => setSelectedFee(row)}
      />

      <Modal
        open={Boolean(selectedFee)}
        onClose={() => setSelectedFee(null)}
        title={studentFor(selectedFee ?? ({} as FeeRecord))?.name ?? 'Fee Details'}
        description="Update fee structure or record a new payment."
        size="lg"
      >
        {selectedFee && (
          <FeeForm
            fee={selectedFee}
            isSubmitting={updateMutation.isPending || addPaymentMutation.isPending}
            onUpdateDetails={(values) => {
              updateMutation.mutate(
                { id: selectedFee.id, patch: values },
                { onSuccess: () => setSelectedFee(null) },
              );
            }}
            onAddPayment={(values) => {
              addPaymentMutation.mutate(
                { feeId: selectedFee.id, payment: values },
                { onSuccess: () => setSelectedFee(null) },
              );
            }}
          />
        )}
      </Modal>
    </div>
  );
}
