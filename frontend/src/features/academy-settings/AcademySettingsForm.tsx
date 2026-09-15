import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient, API_BASE_URL } from '../../services/httpClient';
import { toastSuccess, toastError } from '../../store/toastStore';

const settingsSchema = z.object({
  name: z.string().min(1, 'Academy name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  description: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  workingHours: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const AcademySettingsForm = () => {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const serverBaseUrl = API_BASE_URL.replace('/api', '');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['academySettings'],
    queryFn: async () => {
      const { data } = await httpClient.get('/admin/academy');
      return data.data;
    },
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
      if (settings.logoUrl) {
        setLogoPreview(`${serverBaseUrl}${settings.logoUrl}`);
      }
    }
  }, [settings, form, serverBaseUrl]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await httpClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data.url;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const { data: response } = await httpClient.patch('/admin/academy', data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['academySettings'] });
      toastSuccess('Academy settings updated successfully!');
      form.reset(response.data);
      if (response.data.logoUrl) {
        setLogoPreview(`${serverBaseUrl}${response.data.logoUrl}`);
      }
    },
    onError: () => {
      toastError('Failed to update academy settings.');
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(settings?.logoUrl ? `${serverBaseUrl}${settings.logoUrl}` : null);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    let finalData = { ...data };

    if (logoFile) {
      try {
        const url = await uploadMutation.mutateAsync(logoFile);
        finalData.logoUrl = url;
      } catch (error) {
        toastError('Logo upload failed. Please try again.');
        return;
      }
    }

    mutation.mutate(finalData);
  };

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-6">General Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Academy Name" {...form.register('name')} error={form.formState.errors.name?.message} />

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
              ) : (
                'No logo'
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
              <label
                htmlFor="academy-logo-upload"
                className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload image
              </label>
              <input
                id="academy-logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG or JPG, under 1 MB. Square images work best.</p>
            </div>
          </div>

          <Field label="Email" {...form.register('email')} error={form.formState.errors.email?.message} />
          <Field label="Phone" {...form.register('phone')} error={form.formState.errors.phone?.message} />
          <Field label="WhatsApp" {...form.register('whatsapp')} error={form.formState.errors.whatsapp?.message} />
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-xl font-bold mb-6">Location & Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Address" {...form.register('address')} error={form.formState.errors.address?.message} />
          <Field label="City" {...form.register('city')} error={form.formState.errors.city?.message} />
          <Field label="State" {...form.register('state')} error={form.formState.errors.state?.message} />
          <Field label="Country" {...form.register('country')} error={form.formState.errors.country?.message} />
          <Field label="Working Hours" {...form.register('workingHours')} error={form.formState.errors.workingHours?.message} />
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-xl font-bold mb-6">About the Academy</h3>
        <div className="space-y-6">
          <Field label="Description" {...form.register('description')} error={form.formState.errors.description?.message} isTextArea />
          <Field label="Mission" {...form.register('mission')} error={form.formState.errors.mission?.message} isTextArea />
          <Field label="Vision" {...form.register('vision')} error={form.formState.errors.vision?.message} isTextArea />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending || uploadMutation.isPending}>
          {(mutation.isPending || uploadMutation.isPending) ? 'Saving...' : 'Save Academy Settings'}
        </Button>
      </div>
    </form>
  );
};
