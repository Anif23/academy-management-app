import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarClock, Receipt } from 'lucide-react';
import { feeDetailsSchema, paymentSchema } from '../../schemas/feeSchema';
import type { FeeDetailsFormValues, PaymentFormValues } from '../../schemas/feeSchema';
import type { FeeRecord } from '../../types';
import { computeFeeSummary } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FieldError, FormRow, Input, Label, Select, Textarea } from '../../components/ui/Field';
import { EmptyState } from '../../components/common/States';
import { formatCurrency, formatDate, todayIso } from '../../utils/format';
import { cn } from '../../utils/cn';
import { useCan } from '../../hooks/usePermission';

interface FeeFormProps {
  fee: FeeRecord;
  onUpdateDetails: (values: FeeDetailsFormValues) => void;
  onAddPayment: (values: PaymentFormValues) => void;
  isSubmitting?: boolean;
}

export function FeeForm({ fee, onUpdateDetails, onAddPayment, isSubmitting }: FeeFormProps) {
  const can = useCan();
  const canEditDetails = can('fees:update');
  const canPay = can('fees:create');
  const [mode, setMode] = useState<'details' | 'payment'>(!canEditDetails && canPay ? 'payment' : 'details');
  const summary = computeFeeSummary(fee);
  const paymentStatus = summary.pendingAmount <= 0 ? 'Paid' : summary.paidAmount > 0 ? 'Partial' : 'Pending';
  const paymentStatusTone = paymentStatus === 'Paid' ? 'green' : paymentStatus === 'Partial' ? 'amber' : 'red';

  const detailsForm = useForm<FeeDetailsFormValues>({
    resolver: zodResolver(feeDetailsSchema),
    defaultValues: {
      courseFee: fee.courseFee,
      discount: fee.discount,
      nextPaymentDate: fee.nextPaymentDate,
      remarks: fee.remarks,
    },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: summary.pendingAmount || undefined, date: todayIso(), mode: 'Cash', remarks: '' },
  });

  // Keep the suggested payment amount in sync with the current outstanding
  // balance whenever the payment tab is opened, but never overwrite an
  // amount the admin has already started typing.
  useEffect(() => {
    if (mode !== 'payment') return;
    if (paymentForm.formState.dirtyFields.amount) return;
    paymentForm.setValue('amount', summary.pendingAmount || 0, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, summary.pendingAmount]);

  const sortedPayments = [...fee.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="text-xs text-text-muted">Final Fee</p>
          <p className="text-sm font-semibold text-text-primary">{formatCurrency(summary.finalFee)}</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="text-xs text-text-muted">Paid</p>
          <p className="text-sm font-semibold text-emerald-600">{formatCurrency(summary.paidAmount)}</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="text-xs text-text-muted">Pending</p>
          <p className="text-sm font-semibold text-red-500">{formatCurrency(summary.pendingAmount)}</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-3">
          <p className="text-xs text-text-muted">Status</p>
          <Badge tone={paymentStatusTone} className="mt-1">
            {paymentStatus}
          </Badge>
        </div>
      </div>

      {fee.nextPaymentDate && summary.pendingAmount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          Next payment of {formatCurrency(summary.pendingAmount)} expected on {formatDate(fee.nextPaymentDate)}
        </div>
      )}

      {canEditDetails && canPay && (
      <div className="flex gap-1 rounded-lg border border-border bg-surface-muted p-1">
        <button
          type="button"
          onClick={() => setMode('details')}
          className={cn('flex-1 rounded-md py-1.5 text-sm font-medium transition-colors', mode === 'details' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-muted')}
        >
          Edit Fee Details
        </button>
        <button
          type="button"
          onClick={() => setMode('payment')}
          className={cn('flex-1 rounded-md py-1.5 text-sm font-medium transition-colors', mode === 'payment' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-muted')}
          disabled={summary.pendingAmount <= 0}
          title={summary.pendingAmount <= 0 ? 'Fee is already fully paid' : undefined}
        >
          Record Payment
        </button>
      </div>
      )}

      {(canEditDetails || !canPay) && (
      <div className={mode === 'details' ? 'block' : 'hidden'}>
        <form onSubmit={detailsForm.handleSubmit(onUpdateDetails)} noValidate className="space-y-4">
          <fieldset disabled={!canEditDetails} className="space-y-4 border-0 p-0">
          <FormRow>
            <div>
              <Label htmlFor="fee-course" required>
                Course Fee
              </Label>
              <Input id="fee-course" type="number" error={detailsForm.formState.errors.courseFee?.message} {...detailsForm.register('courseFee')} />
              <FieldError message={detailsForm.formState.errors.courseFee?.message} />
            </div>
            <div>
              <Label htmlFor="fee-discount">Discount</Label>
              <Input id="fee-discount" type="number" error={detailsForm.formState.errors.discount?.message} {...detailsForm.register('discount')} />
              <FieldError message={detailsForm.formState.errors.discount?.message} />
            </div>
          </FormRow>
          <div>
            <Label htmlFor="fee-next-date">Next Payment Date</Label>
            <Input id="fee-next-date" type="date" {...detailsForm.register('nextPaymentDate')} />
          </div>
          <div>
            <Label htmlFor="fee-remarks">Payment Remarks</Label>
            <Textarea id="fee-remarks" rows={3} {...detailsForm.register('remarks')} />
          </div>
          </fieldset>
          {canEditDetails && (
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSubmitting}>
                Save Fee Details
              </Button>
            </div>
          )}
        </form>
      </div>
      )}

      {canPay && (
      <div className={mode === 'payment' ? 'block' : 'hidden'}>
        <form onSubmit={paymentForm.handleSubmit(onAddPayment)} noValidate className="space-y-4">
          <FormRow>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="pay-amount" required className="mb-0">
                  Amount
                </Label>
                <button
                  type="button"
                  onClick={() => paymentForm.setValue('amount', summary.pendingAmount, { shouldValidate: true, shouldDirty: true })}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Use full pending amount
                </button>
              </div>
              <Input id="pay-amount" type="number" error={paymentForm.formState.errors.amount?.message} {...paymentForm.register('amount')} />
              <FieldError message={paymentForm.formState.errors.amount?.message} />
            </div>
            <div>
              <Label htmlFor="pay-date" required>
                Payment Date
              </Label>
              <Input id="pay-date" type="date" max={todayIso()} error={paymentForm.formState.errors.date?.message} {...paymentForm.register('date')} />
              <FieldError message={paymentForm.formState.errors.date?.message} />
            </div>
          </FormRow>
          <div>
            <Label htmlFor="pay-mode" required>
              Payment Mode
            </Label>
            <Select id="pay-mode" {...paymentForm.register('mode')}>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="pay-remarks">Remarks</Label>
            <Textarea id="pay-remarks" rows={2} {...paymentForm.register('remarks')} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting}>
              Record Payment
            </Button>
          </div>
        </form>
      </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
          <Receipt className="h-3.5 w-3.5" />
          Payment History
        </p>
        {sortedPayments.length === 0 ? (
          <EmptyState title="No payments recorded yet" description="Payments you record will appear here." />
        ) : (
          <div className="max-h-48 divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {sortedPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-text-primary">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-text-muted">
                    {formatDate(payment.date)} · {payment.mode}
                  </p>
                </div>
                {payment.remarks && <p className="max-w-[45%] truncate text-right text-xs text-text-muted" title={payment.remarks}>{payment.remarks}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
