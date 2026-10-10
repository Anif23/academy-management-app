import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import { homeRouteForRole } from '../utils/rolePermissions';
import { toastSuccess } from '../store/toastStore';
import { Button } from '../components/ui/Button';
import { FieldError, Input, Label } from '../components/ui/Field';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation don't match.",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePassword() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const forced = Boolean(user?.mustChangePassword);
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  async function onSubmit(values: FormValues) {
    setServerError('');
    try {
      const updated = await authApi.changePassword(values);
      updateUser(updated);
      toastSuccess('Password changed', 'Your password has been updated.');
      navigate(homeRouteForRole(updated.role, updated.permissions), { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not change your password.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            {forced ? 'Set a new password' : 'Change your password'}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {forced
              ? 'For security, you must set a new password before continuing.'
              : 'Update the password used to sign in to your account.'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
          {forced && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Your current password is the temporary one you were given (your email address).</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {serverError}
              </div>
            )}

            <div>
              <Label htmlFor="currentPassword" required>
                Current password
              </Label>
              <Input
                id="currentPassword"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
              <FieldError message={errors.currentPassword?.message} />
            </div>

            <div>
              <Label htmlFor="newPassword" required>
                New password
              </Label>
              <Input
                id="newPassword"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <FieldError message={errors.newPassword?.message} />
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? 'Hide passwords' : 'Show passwords'}
            </button>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              {forced ? 'Set password & continue' : 'Update password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
