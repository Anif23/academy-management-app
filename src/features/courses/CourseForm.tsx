import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CourseRecord } from '../../types';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select, Textarea } from '../../components/ui/Field';

const courseSchema = z.object({
  name: z.string().min(2, 'Course name is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  fee: z.coerce.number().min(0, 'Fee must be a positive number.'),
  description: z.string().optional().default(''),
  status: z.enum(['Active', 'Inactive']),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  defaultValues?: Partial<CourseRecord>;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CourseForm({ defaultValues, onSubmit, onCancel, isSubmitting }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      duration: defaultValues?.duration ?? '',
      fee: defaultValues?.fee ?? 0,
      description: defaultValues?.description ?? '',
      status: defaultValues?.status ?? 'Active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="course-name" required>
          Course Name
        </Label>
        <Input id="course-name" error={errors.name?.message} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>

      <FormRow>
        <div>
          <Label htmlFor="course-duration" required>
            Duration
          </Label>
          <Input id="course-duration" placeholder="e.g. 6 Months" error={errors.duration?.message} {...register('duration')} />
          <FieldError message={errors.duration?.message} />
        </div>
        <div>
          <Label htmlFor="course-fee" required>
            Course Fee
          </Label>
          <Input id="course-fee" type="number" min={0} error={errors.fee?.message} {...register('fee')} />
          <FieldError message={errors.fee?.message} />
        </div>
      </FormRow>

      <div>
        <Label htmlFor="course-status" required>
          Status
        </Label>
        <Select id="course-status" {...register('status')}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>
        <p className="mt-1.5 text-xs text-text-muted">
          Inactive courses stay visible on existing records but won't appear as an option for new registrations.
        </p>
      </div>

      <div>
        <Label htmlFor="course-description">Description</Label>
        <Textarea id="course-description" rows={3} {...register('description')} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues?.id ? 'Save Changes' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}
