import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Facebook, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../services/httpClient';
import { uploadFile } from '../../services/uploadApi';
import { toastSuccess, toastError } from '../../store/toastStore';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: 'Must start with http:// or https://' })
  .or(z.literal(''));

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
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  twitterUrl: optionalUrl,
  legalName: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().optional().or(z.literal('')),
  grievanceOfficerName: z.string().optional().or(z.literal('')),
  grievanceOfficerEmail: z.string().email('Valid email required').optional().or(z.literal('')),
  grievanceOfficerPhone: z.string().optional().or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const AcademySettingsForm = () => {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const resolveLogoUrl = (url?: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//.test(url)) return url;
    return `${httpClient.defaults.baseURL?.replace(/\/api\/?$/, '')}${url}`;
  };

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
      setLogoPreview(resolveLogoUrl(settings.logoUrl));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const { data: response } = await httpClient.patch('/admin/academy', data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['academySettings'] });
      toastSuccess('Academy settings updated successfully!');
      form.reset(response.data);
      setLogoPreview(resolveLogoUrl(response.data.logoUrl));
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
      setLogoPreview(resolveLogoUrl(settings?.logoUrl));
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    const finalData = { ...data };

    if (logoFile) {
      setUploadingLogo(true);
      try {
        const uploaded = await uploadFile(logoFile, 'misc');
        finalData.logoUrl = uploaded.url;
      } catch (error) {
        toastError('Logo upload failed. Please try again.', error instanceof Error ? error.message : undefined);
        setUploadingLogo(false);
        return;
      }
      setUploadingLogo(false);
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

      <Card className="p-8">
        <h3 className="text-xl font-bold mb-6">Social Links</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 -mt-4">
          Shown as icons in the public website's footer. Leave blank to hide an icon.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-2">
            <Facebook className="h-4 w-4 shrink-0 text-gray-400" />
            <Field label="Facebook" {...form.register('facebookUrl')} error={form.formState.errors.facebookUrl?.message} placeholder="https://facebook.com/youracademy" />
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4 shrink-0 text-gray-400" />
            <Field label="Instagram" {...form.register('instagramUrl')} error={form.formState.errors.instagramUrl?.message} placeholder="https://instagram.com/youracademy" />
          </div>
          <div className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 shrink-0 text-gray-400" />
            <Field label="LinkedIn" {...form.register('linkedinUrl')} error={form.formState.errors.linkedinUrl?.message} placeholder="https://linkedin.com/company/youracademy" />
          </div>
          <div className="flex items-center gap-2">
            <Youtube className="h-4 w-4 shrink-0 text-gray-400" />
            <Field label="YouTube" {...form.register('youtubeUrl')} error={form.formState.errors.youtubeUrl?.message} placeholder="https://youtube.com/@youracademy" />
          </div>
          <div className="flex items-center gap-2">
            <Twitter className="h-4 w-4 shrink-0 text-gray-400" />
            <Field label="Twitter / X" {...form.register('twitterUrl')} error={form.formState.errors.twitterUrl?.message} placeholder="https://x.com/youracademy" />
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <h3 className="text-xl font-bold mb-2">Legal & Compliance</h3>
        <p className="mb-6 text-sm text-secondary">
          Shown in the site footer and referenced by the Privacy Policy. A real grievance contact is required
          under India's Digital Personal Data Protection Act, 2023.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Registered Legal Name"
            {...form.register('legalName')}
            error={form.formState.errors.legalName?.message}
            placeholder="e.g. Academy Pro Education Pvt. Ltd."
          />
          <Field
            label="Business Registration No. (CIN/GST/etc.)"
            {...form.register('registrationNumber')}
            error={form.formState.errors.registrationNumber?.message}
          />
          <Field
            label="Grievance Officer Name"
            {...form.register('grievanceOfficerName')}
            error={form.formState.errors.grievanceOfficerName?.message}
          />
          <Field
            label="Grievance Officer Email"
            {...form.register('grievanceOfficerEmail')}
            error={form.formState.errors.grievanceOfficerEmail?.message}
          />
          <Field
            label="Grievance Officer Phone"
            {...form.register('grievanceOfficerPhone')}
            error={form.formState.errors.grievanceOfficerPhone?.message}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending || uploadingLogo}>
          {(mutation.isPending || uploadingLogo) ? 'Saving...' : 'Save Academy Settings'}
        </Button>
      </div>
    </form>
  );
};
