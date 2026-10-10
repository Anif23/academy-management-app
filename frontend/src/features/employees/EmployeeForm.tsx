import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { employeeSchema } from '../../schemas/employeeSchema';
import type { EmployeeFormValues } from '../../schemas/employeeSchema';
import type { Employee } from '../../types';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select } from '../../components/ui/Field';
import { todayIso } from '../../utils/format';

interface EmployeeFormProps {
  defaultValues?: Partial<Employee>;
  onSubmit: (values: EmployeeFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EmployeeForm({ defaultValues, onSubmit, onCancel, isSubmitting }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? 'Trainer',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      status: defaultValues?.status ?? 'Active',
      joiningDate: defaultValues?.joiningDate ?? todayIso(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormRow>
        <div>
          <Label htmlFor="emp-name" required>
            Name
          </Label>
          <Input id="emp-name" error={errors.name?.message} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="emp-type" required>
            Employee Type
          </Label>
          <Select id="emp-type" {...register('type')}>
            <option value="Trainer">Trainer</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Video Editor">Video Editor</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Counsellor">Counsellor</option>
          </Select>
          <p className="mt-1.5 text-xs text-text-muted">
            Only Trainers and Counsellors get an app login (email as first password). Other roles are records only.
          </p>
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="emp-email" required>
            Email
          </Label>
          <Input id="emp-email" type="email" error={errors.email?.message} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="emp-phone" required>
            Phone
          </Label>
          <Input id="emp-phone" maxLength={10} error={errors.phone?.message} {...register('phone')} />
          <FieldError message={errors.phone?.message} />
        </div>
      </FormRow>

      <FormRow>
        <div>
          <Label htmlFor="emp-joining" required>
            Joining Date
          </Label>
          <Input id="emp-joining" type="date" error={errors.joiningDate?.message} {...register('joiningDate')} />
          <FieldError message={errors.joiningDate?.message} />
        </div>
        <div>
          <Label htmlFor="emp-status" required>
            Status
          </Label>
          <Select id="emp-status" {...register('status')}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </FormRow>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues?.id ? 'Save Changes' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
