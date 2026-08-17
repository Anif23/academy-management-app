import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { RotateCcw, Upload } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FieldError, Input, Label } from '../components/ui/Field';
import { useBrandingStore } from '../store/brandingStore';
import { toastSuccess } from '../store/toastStore';

const brandingSchema = z.object({
  appName: z.string().min(2, 'App name must be at least 2 characters.').max(40, 'Keep it under 40 characters.'),
  tagline: z.string().max(60, 'Keep it under 60 characters.').optional().default(''),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

export default function Settings() {
  const appName = useBrandingStore((s) => s.appName);
  const tagline = useBrandingStore((s) => s.tagline);
  const logoDataUrl = useBrandingStore((s) => s.logoDataUrl);
  const setBranding = useBrandingStore((s) => s.setBranding);
  const resetBranding = useBrandingStore((s) => s.resetBranding);

  const [logoPreview, setLogoPreview] = useState(logoDataUrl);
  const [logoError, setLogoError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { appName, tagline },
  });

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setLogoError('Logo must be smaller than 1 MB.');
      return;
    }
    setLogoError('');
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onSubmit(values: BrandingFormValues) {
    setBranding({ appName: values.appName, tagline: values.tagline ?? '', logoDataUrl: logoPreview });
    toastSuccess('Branding updated successfully.', 'Your changes are visible across the whole app immediately.');
  }

  function handleReset() {
    resetBranding();
    setLogoPreview('');
    toastSuccess('Branding reset to defaults.');
  }

  return (
    <div>
      <PageHeader title="Settings" description="Customize how Acadmey looks for everyone using this workspace." />

      <Card>
        <CardHeader title="App Branding" description="Update the app name, tagline, and logo shown in the sidebar and login screen." />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-muted text-xs text-text-muted">
                {logoPreview ? <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" /> : 'No logo'}
              </div>
              <div>
                <Label htmlFor="logo-upload">Logo</Label>
                <label
                  htmlFor="logo-upload"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload image
                </label>
                <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                {logoError && <p className="mt-1 text-xs font-medium text-red-500">{logoError}</p>}
                <p className="mt-1 text-xs text-text-muted">PNG or JPG, under 1 MB. Square images work best.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="app-name" required>
                App Name
              </Label>
              <Input id="app-name" error={errors.appName?.message} {...register('appName')} />
              <FieldError message={errors.appName?.message} />
            </div>

            <div>
              <Label htmlFor="app-tagline">Tagline</Label>
              <Input id="app-tagline" placeholder="e.g. Student Management" error={errors.tagline?.message} {...register('tagline')} />
              <FieldError message={errors.tagline?.message} />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button type="button" variant="ghost" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </Button>
              <Button type="submit" disabled={!isDirty && logoPreview === logoDataUrl}>
                Save Branding
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
