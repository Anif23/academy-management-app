import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../services/httpClient';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { toastSuccess, toastError } from '../../store/toastStore';
import { Trash2, Edit3, Megaphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const announcementSchema = z.object({
  message: z.string().min(1, 'Message is required').max(280),
  tag: z.string().max(24).optional().or(z.literal('')),
  link: z.string().url('Must be a valid URL, e.g. https://...').optional().or(z.literal('')),
  order: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface Announcement extends AnnouncementFormData {
  id: string;
}

export const AnnouncementsManager = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: async () => {
      const { data } = await httpClient.get('/admin/announcements');
      return data.data as Announcement[];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: AnnouncementFormData }) => {
      const payload = { ...data, startsAt: data.startsAt || null, endsAt: data.endsAt || null };
      if (id) return httpClient.patch(`/admin/announcements/${id}`, payload);
      return httpClient.post('/admin/announcements', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      toastSuccess(isEditing ? 'Announcement updated' : 'Announcement added', 'It will appear on the public site within a minute.');
      setIsEditing(null);
      form.reset({ message: '', tag: '', link: '', order: 0, isActive: true, startsAt: '', endsAt: '' });
    },
    onError: (error: any) => toastError("Couldn't save announcement", error?.response?.data?.message ?? error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => httpClient.delete(`/admin/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      toastSuccess('Announcement removed');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (a: Announcement) => httpClient.patch(`/admin/announcements/${a.id}`, { isActive: !a.isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] }),
  });

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { message: '', tag: '', link: '', order: 0, isActive: true, startsAt: '', endsAt: '' },
  });

  const handleSave = (data: AnnouncementFormData) => mutation.mutate({ id: isEditing ?? undefined, data });

  if (isLoading) return <div className="p-8 text-center">Loading announcements...</div>;

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="mb-6 flex items-center gap-2">
          <Megaphone size={20} className="text-accent" />
          <h3 className="text-xl font-bold">{isEditing ? 'Edit Announcement' : 'Add Announcement / Offer'}</h3>
        </div>
        <form onSubmit={form.handleSubmit(handleSave)} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Message"
              {...form.register('message')}
              error={form.formState.errors.message?.message}
              placeholder="e.g. 20% off Full-Stack batch starting Oct 1 — limited seats!"
            />
          </div>
          <Field label="Tag (optional)" {...form.register('tag')} placeholder="Offer, New, Alert..." />
          <Field label="Link (optional)" {...form.register('link')} error={form.formState.errors.link?.message} placeholder="https://..." />
          <Field label="Order" {...form.register('order')} type="number" />
          <div className="flex items-center gap-2 pt-6">
            <input id="ann-active" type="checkbox" className="h-4 w-4 rounded border-slate-300" {...form.register('isActive')} />
            <label htmlFor="ann-active" className="text-sm font-medium text-secondary">
              Active
            </label>
          </div>
          <Field label="Starts (optional)" type="datetime-local" {...form.register('startsAt')} />
          <Field label="Ends (optional)" type="datetime-local" {...form.register('endsAt')} />
          <div className="flex items-end gap-4 md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              {isEditing ? 'Update' : 'Add to ticker'}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(null);
                  form.reset({ message: '', tag: '', link: '', order: 0, isActive: true, startsAt: '', endsAt: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {announcements?.length === 0 && (
          <p className="text-sm text-secondary">No announcements yet — add one above to show it as a running banner on the public site.</p>
        )}
        {announcements?.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {a.tag && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{a.tag}</span>}
                {!a.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Paused</span>}
              </div>
              <p className="mt-1 truncate font-medium text-primary">{a.message}</p>
              {a.link && <p className="truncate text-xs text-secondary">{a.link}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate(a)}>
                {a.isActive ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(a.id);
                  form.reset({
                    ...a,
                    startsAt: a.startsAt ? String(a.startsAt).slice(0, 16) : '',
                    endsAt: a.endsAt ? String(a.endsAt).slice(0, 16) : '',
                  });
                }}
              >
                <Edit3 size={16} />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate(a.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsManager;
