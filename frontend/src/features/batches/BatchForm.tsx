import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { batchSchema } from '../../schemas/batchSchema';
import type { BatchFormValues } from '../../schemas/batchSchema';
import type { Batch, CourseRecord, Employee } from '../../types';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { FieldError, FormRow, Input, Label, Select } from '../../components/ui/Field';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface BatchFormProps {
  defaultValues?: Partial<Batch>;
  trainers: Employee[];
  courses: CourseRecord[];
  onSubmit: (values: BatchFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BatchForm({ defaultValues, trainers, courses, onSubmit, onCancel, isSubmitting }: BatchFormProps) {
  const activeCourses = courses.filter((c) => c.status === 'Active' || c.id === defaultValues?.courseId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchId: defaultValues?.batchId ?? '',
      courseId: defaultValues?.courseId ?? activeCourses[0]?.id ?? '',
      name: defaultValues?.name ?? '',
      startDate: defaultValues?.startDate ?? '',
      endDate: defaultValues?.endDate ?? '',
      classTiming: defaultValues?.classTiming ?? '',
      days: defaultValues?.days ?? [],
      trainerId: defaultValues?.trainerId ?? trainers[0]?.id ?? '',
      status: defaultValues?.status ?? 'Upcoming',
    },
  });

  const selectedDays = watch('days');

  function toggleDay(day: string) {
    const next = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day];
    setValue('days', next, { shouldValidate: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormRow>
        <div>
          <Label htmlFor="batch-id" required>
            Batch ID
          </Label>
          <Input id="batch-id" placeholder="e.g. FS-APR-01" error={errors.batchId?.message} {...register('batchId')} />
          <FieldError message={errors.batchId?.message} />
        </div>
        <div>
          <Label htmlFor="batch-name" required>
            Batch Name
          </Label>
          <Input id="batch-name" error={errors.name?.message} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="batch-course" required>
            Course
          </Label>
          <Select id="batch-course" {...register('courseId')}>
            {activeCourses.length === 0 && (
              <option value="" disabled>
                No courses available — add one first
              </option>
            )}
            {activeCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="batch-trainer" required>
            Trainer
          </Label>
          <Select id="batch-trainer" error={errors.trainerId?.message} {...register('trainerId')}>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.trainerId?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="batch-start" required>
            Start Date
          </Label>
          <Input id="batch-start" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <FieldError message={errors.startDate?.message} />
        </div>
        <div>
          <Label htmlFor="batch-end" required>
            End Date
          </Label>
          <Input id="batch-end" type="date" error={errors.endDate?.message} {...register('endDate')} />
          <FieldError message={errors.endDate?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="batch-timing" required>
            Class Timing
          </Label>
          <Input id="batch-timing" placeholder="e.g. 6:00 PM - 8:00 PM" error={errors.classTiming?.message} {...register('classTiming')} />
          <FieldError message={errors.classTiming?.message} />
        </div>
        <div>
          <Label htmlFor="batch-status" required>
            Status
          </Label>
          <Select id="batch-status" {...register('status')}>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </Select>
        </div>
      </FormRow>

      <div>
        <Label required>Class Days</Label>
        <div className="flex flex-wrap gap-3">
          {WEEK_DAYS.map((day) => (
            <label key={day} className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Checkbox checked={selectedDays.includes(day)} onChange={() => toggleDay(day)} />
              {day}
            </label>
          ))}
        </div>
        <FieldError message={errors.days?.message} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues?.id ? 'Save Changes' : 'Create Batch'}
        </Button>
      </div>
    </form>
  );
}
