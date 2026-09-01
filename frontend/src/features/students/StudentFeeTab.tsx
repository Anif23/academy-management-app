import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/States';
import type { FeeRecord } from '../../types';
import { computeFeeSummary } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

export function StudentFeeTab({ fee }: { fee: FeeRecord | null | undefined }) {
  if (!fee) {
    return (
      <Card>
        <EmptyState title="No fee record found" description="Fee details have not been set up for this student yet." />
      </Card>
    );
  }

  const summary = computeFeeSummary(fee);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Course Fee', value: summary.courseFee, tone: 'text-text-primary' },
          { label: 'Discount', value: summary.discount, tone: 'text-amber-600' },
          { label: 'Final Fee', value: summary.finalFee, tone: 'text-text-primary' },
          { label: 'Paid', value: summary.paidAmount, tone: 'text-emerald-600' },
          { label: 'Pending', value: summary.pendingAmount, tone: 'text-red-500' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-surface p-4 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{item.label}</p>
            <p className={`mt-1.5 text-base font-semibold ${item.tone}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Payment History" description={`Next payment due: ${fee.nextPaymentDate ? formatDate(fee.nextPaymentDate) : 'None'}`} />
        {fee.payments.length === 0 ? (
          <EmptyState title="No payments recorded" />
        ) : (
          <div className="divide-y divide-border">
            {fee.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-text-primary">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-text-muted">
                    {formatDate(payment.date)} · {payment.mode}
                  </p>
                </div>
                {payment.remarks && <p className="max-w-xs text-right text-xs text-text-muted">{payment.remarks}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {fee.remarks && (
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Remarks</p>
            <p className="mt-1 text-sm text-text-secondary">{fee.remarks}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
