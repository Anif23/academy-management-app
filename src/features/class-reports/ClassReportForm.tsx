import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarCheck } from 'lucide-react';
import { classReportSchema } from '../../schemas/classReportSchema';
import type { ClassReportFormValues } from '../../schemas/classReportSchema';
import type { Batch, ClassReport, Employee } from '../../types';
import { computeClassAttendance } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select, Textarea } from '../../components/ui/Field';
import { todayIso } from '../../utils/format';

interface ClassReportFormProps {
  defaultValues?: Partial<ClassReport>;
  batches: Batch[];
  trainers: Employee[];
  onSubmit: (values: ClassReportFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ClassReportForm({ defaultValues, batches, trainers, onSubmit, onCancel, isSubmitting }: ClassReportFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClassReportFormValues>({
    resolver: zodResolver(classReportSchema),
    defaultValues: {
      date: defaultValues?.date ?? todayIso(),
      batchId: defaultValues?.batchId ?? batches[0]?.id ?? '',
      trainerId: defaultValues?.trainerId ?? trainers[0]?.id ?? '',
      topic: defaultValues?.topic ?? '',
      module: defaultValues?.module ?? '',
      description: defaultValues?.description ?? '',
      tasksGiven: defaultValues?.tasksGiven ?? '',
      taskStatus: defaultValues?.taskStatus ?? 'Given',
      studentPerformance: defaultValues?.studentPerformance ?? '',
      remarks: defaultValues?.remarks ?? '',
      nextClassPlan: defaultValues?.nextClassPlan ?? '',
    },
  });

  const watchedBatchId = watch('batchId');
  const watchedDate = watch('date');
  const attendance = computeClassAttendance(watchedBatchId, watchedDate);
  const selectedBatch = batches.find((b) => b.id === watchedBatchId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormRow>
        <div>
          <Label htmlFor="cr-date" required>
            Date
          </Label>
          <Input id="cr-date" type="date" max={todayIso()} error={errors.date?.message} {...register('date')} />
          <FieldError message={errors.date?.message} />
        </div>
        <div>
          <Label htmlFor="cr-batch" required>
            Batch
          </Label>
          <Select id="cr-batch" error={errors.batchId?.message} {...register('batchId')}>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.batchId?.message} />
        </div>
      </FormRow>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-xs text-text-secondary">
        <CalendarCheck className="h-4 w-4 shrink-0 text-brand-600" />
        {attendance.marked ? (
          <span>
            <span className="font-semibold text-text-primary">
              {attendance.present}/{attendance.total}
            </span>{' '}
            students marked present for {selectedBatch?.batchId ?? 'this batch'} on this date — pulled live from Attendance.
          </span>
        ) : (
          <span>
            Attendance hasn't been marked for {selectedBatch?.batchId ?? 'this batch'} on this date yet. Mark it on the
            Attendance page and it will show here automatically.
          </span>
        )}
      </div>

      <FormRow>
        <div>
          <Label htmlFor="cr-trainer" required>
            Trainer
          </Label>
          <Select id="cr-trainer" error={errors.trainerId?.message} {...register('trainerId')}>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.trainerId?.message} />
        </div>
        <div>
          <Label htmlFor="cr-module" required>
            Module
          </Label>
          <Input id="cr-module" error={errors.module?.message} {...register('module')} />
          <FieldError message={errors.module?.message} />
        </div>
      </FormRow>

      <div>
        <Label htmlFor="cr-topic" required>
          Topic
        </Label>
        <Input id="cr-topic" error={errors.topic?.message} {...register('topic')} />
        <FieldError message={errors.topic?.message} />
      </div>

      <div>
        <Label htmlFor="cr-description" required>
          Description
        </Label>
        <Textarea id="cr-description" rows={3} error={errors.description?.message} {...register('description')} />
        <FieldError message={errors.description?.message} />
      </div>

      <div>
        <Label htmlFor="cr-tasks">Tasks Given</Label>
        <Textarea id="cr-tasks" rows={2} {...register('tasksGiven')} />
      </div>

      <div>
        <Label htmlFor="cr-task-status" required>
          Task Status
        </Label>
        <Select id="cr-task-status" {...register('taskStatus')}>
          <option value="Not Given">Not Given</option>
          <option value="Given">Given</option>
          <option value="Reviewed">Reviewed</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="cr-performance">Student Performance</Label>
        <Textarea id="cr-performance" rows={2} {...register('studentPerformance')} />
      </div>

      <div>
        <Label htmlFor="cr-remarks">Remarks</Label>
        <Textarea id="cr-remarks" rows={2} {...register('remarks')} />
      </div>

      <div>
        <Label htmlFor="cr-next-plan">Next Class Plan</Label>
        <Textarea id="cr-next-plan" rows={2} {...register('nextClassPlan')} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues?.id ? 'Save Changes' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
}
