import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Briefcase, Mail, KeyRound, Pencil, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FieldError, Input, Label } from '../components/ui/Field';
import { useAuthStore } from '../store/authStore';
import { toastError, toastSuccess } from '../store/toastStore';
import { authApi } from '../services/authApi';
import { initials } from '../utils/format';

// Role and department are managed by an admin (see Users page), never by
// the account holder themselves — so they're never part of this form,
// only ever shown read-only below.
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z
    .string()
    .min(10, 'Enter a valid 10-digit phone number.')
    .max(10, 'Enter a valid 10-digit phone number.')
    .regex(/^\d+$/, 'Phone number must contain digits only.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: (user?.phone ?? '').replace(/\D/g, '').slice(-10),
    },
  });

  if (!user) return null;

  async function onSubmit(values: ProfileFormValues) {
    try {
      const updated = await authApi.updateProfile({ name: values.name, phone: values.phone });
      updateUser(updated);
      toastSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (error) {
      toastError('Could not update profile', error instanceof Error ? error.message : undefined);
    }
  }

  function handleCancel() {
    if (!user) return;
    reset({ name: user.name, phone: user.phone.replace(/\D/g, '').slice(-10) });
    setEditing(false);
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Your account details."
        action={
          !editing && (
            <div className="flex items-center gap-2">
              <Link to="/change-password">
                <Button variant="outline" size="sm">
                  <KeyRound className="h-3.5 w-3.5" />
                  Change Password
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-semibold text-white">
              {initials(user.name)}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-text-primary">{user.name}</h2>
            <p className="text-sm text-text-muted">{user.email}</p>
            <div className="mt-3">
              <Badge tone="green">{user.status}</Badge>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Account Details" description={editing ? 'Update your profile information.' : undefined} />
          <CardBody>
            {editing ? (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                  <Label htmlFor="profile-name" required>
                    Name
                  </Label>
                  <Input id="profile-name" error={errors.name?.message} {...register('name')} />
                  <FieldError message={errors.name?.message} />
                </div>
                <div>
                  <Label htmlFor="profile-phone" required>
                    Phone
                  </Label>
                  <Input id="profile-phone" maxLength={10} error={errors.phone?.message} {...register('phone')} />
                  <FieldError message={errors.phone?.message} />
                </div>
                <div>
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" value={user.email} disabled />
                  <p className="mt-1.5 text-xs text-text-muted">Email is tied to your login and can't be changed here.</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-xs text-text-muted">
                  Role and department are set by an administrator and can't be changed from your own profile.
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={isSubmitting}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Role
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">{user.role}</dd>
                </div>
                {user.department && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                      <Briefcase className="h-3.5 w-3.5" />
                      Department
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">{user.department}</dd>
                  </div>
                )}
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">{user.email}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">{user.phone}</dd>
                </div>
              </dl>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
