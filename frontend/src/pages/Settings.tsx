import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, RotateCcw, Upload } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FieldError, Input, Label } from '../components/ui/Field';
import { useBrandingStore } from '../store/brandingStore';
import { brandingApi } from '../services/brandingApi';
import { uploadFile } from '../services/uploadApi';
import { toastError, toastSuccess } from '../store/toastStore';

const DEFAULTS = { appName: 'Academy Management', tagline: 'For Managing Everything' };

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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(logoDataUrl);
  const [logoError, setLogoError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo must be smaller than 2 MB.');
      return;
    }
    setLogoError('');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: BrandingFormValues) {
    setIsSaving(true);
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        const uploaded = await uploadFile(logoFile, 'misc');
        logoUrl = uploaded.url;
      }

      const saved = await brandingApi.update({
        appName: values.appName,
        tagline: values.tagline ?? '',
        ...(logoUrl ? { logoUrl } : {}),
      });

      setBranding({
        appName: saved.appName,
        tagline: saved.tagline,
        logoDataUrl: logoUrl ?? logoDataUrl,
      });
      setLogoFile(null);
      toastSuccess('Branding updated successfully.', 'Visible to every admin, everywhere — not just this browser.');
    } catch (error) {
      toastError('Could not save branding', error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    setIsSaving(true);
    try {
      const saved = await brandingApi.update({ appName: DEFAULTS.appName, tagline: DEFAULTS.tagline, logoUrl: '' });
      setBranding({ appName: saved.appName, tagline: saved.tagline, logoDataUrl: '' });
      setLogoPreview('');
      setLogoFile(null);
      toastSuccess('Branding reset to defaults.');
    } catch (error) {
      toastError('Could not reset branding', error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Customize how the app looks for every admin — stored on the server, not just this browser." />

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
                <p className="mt-1 text-xs text-text-muted">PNG or JPG, under 2 MB. Square images work best.</p>
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
              <Button type="button" variant="ghost" onClick={handleReset} disabled={isSaving}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </Button>
              <Button type="submit" disabled={isSaving || (!isDirty && !logoFile)}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Branding'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
