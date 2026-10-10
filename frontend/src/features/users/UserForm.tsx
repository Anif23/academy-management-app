import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ManagedUser } from '../../hooks/useUsers';
import { Button } from '../../components/ui/Button';
import { FieldError, FormRow, Input, Label, Select } from '../../components/ui/Field';

const createSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['ADMIN', 'STAFF', 'COUNSELLOR', 'STUDENT']),
  phone: z.string().trim().optional().default(''),
});

const editSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  role: z.enum(['ADMIN', 'STAFF', 'COUNSELLOR', 'STUDENT']),
  phone: z.string().trim().optional().default(''),
  status: z.enum(['Active', 'Inactive']),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface UserFormProps {
  defaultValues?: ManagedUser;
  onSubmitCreate: (values: CreateValues) => void;
  onSubmitEdit: (values: EditValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UserForm({ defaultValues, onSubmitCreate, onSubmitEdit, onCancel, isSubmitting }: UserFormProps) {
  const isEditing = Boolean(defaultValues?.id);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', role: 'STAFF', phone: '' },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      role: defaultValues?.role ?? 'STAFF',
      phone: defaultValues?.phone ?? '',
      status: defaultValues?.status ?? 'Active',
    },
  });

  if (isEditing) {
    return (
      <form onSubmit={editForm.handleSubmit(onSubmitEdit)} noValidate className="space-y-4">
        <div className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-text-secondary">{defaultValues?.email}</div>
        <div>
          <Label htmlFor="user-name" required>
            Name
          </Label>
          <Input id="user-name" error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
          <FieldError message={editForm.formState.errors.name?.message} />
        </div>
        <FormRow>
          <div>
            <Label htmlFor="user-role" required>
              Role
            </Label>
            <Select id="user-role" {...editForm.register('role')}>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Trainer (Staff)</option>
              <option value="COUNSELLOR">Counsellor</option>
              <option value="STUDENT">Student</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="user-status" required>
              Status
            </Label>
            <Select id="user-status" {...editForm.register('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
        </FormRow>
        <FormRow>
          <div>
            <Label htmlFor="user-phone">Phone</Label>
            <Input id="user-phone" {...editForm.register('phone')} />
          </div>
        </FormRow>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={createForm.handleSubmit(onSubmitCreate)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="new-user-name" required>
          Name
        </Label>
        <Input id="new-user-name" error={createForm.formState.errors.name?.message} {...createForm.register('name')} />
        <FieldError message={createForm.formState.errors.name?.message} />
      </div>
      <div>
        <Label htmlFor="new-user-email" required>
          Email
        </Label>
        <Input id="new-user-email" type="email" error={createForm.formState.errors.email?.message} {...createForm.register('email')} />
        <FieldError message={createForm.formState.errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="new-user-password" required>
          Temporary Password
        </Label>
        <Input id="new-user-password" type="password" error={createForm.formState.errors.password?.message} {...createForm.register('password')} />
        <FieldError message={createForm.formState.errors.password?.message} />
      </div>
      <div>
        <Label htmlFor="new-user-role" required>
          Role
        </Label>
        <Select id="new-user-role" {...createForm.register('role')}>
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Trainer (Staff)</option>
              <option value="COUNSELLOR">Counsellor</option>
          <option value="STUDENT">Student</option>
        </Select>
        <p className="mt-1.5 text-xs text-text-muted">
          Trainer, Counsellor and Student accounts control what this login can see and do — enforced by the backend regardless of the frontend.
        </p>
      </div>
      <div>
        <Label htmlFor="new-user-phone">Phone</Label>
        <Input id="new-user-phone" {...createForm.register('phone')} />
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create Account
        </Button>
      </div>
    </form>
  );
}
