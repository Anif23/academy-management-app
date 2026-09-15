import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../services/httpClient';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { toastSuccess } from '../../store/toastStore';
import { Trash2, Edit3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const testimonialSchema = z.object({
  studentName: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  photo: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export const TestimonialsManager = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: async () => {
      const { data } = await httpClient.get('/admin/testimonials');
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: TestimonialFormData }) => {
      if (id) {
        return httpClient.patch(`/admin/testimonials/${id}`, data);
      }
      return httpClient.post('/admin/testimonials', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      toastSuccess('Testimonial saved successfully!');
      setIsEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => httpClient.delete(`/admin/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      toastSuccess('Testimonial removed!');
    },
  });

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
  });

  const handleSave = (data: TestimonialFormData) => {
    mutation.mutate({ id: isEditing ?? undefined, data });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-12">
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-6">Add/Edit Testimonial</h3>
        <form onSubmit={form.handleSubmit(handleSave)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Student Name" {...form.register('studentName')} error={form.formState.errors.studentName?.message} />
          <Field label="Role/Position" {...form.register('role')} />
          <div className="md:col-span-2">
            <Field label="Testimonial Content" {...form.register('content')} error={form.formState.errors.content?.message} isTextArea />
          </div>
          <Field label="Photo URL" {...form.register('photo')} />
          <Field label="Rating (1-5)" {...form.register('rating')} type="number" error={form.formState.errors.rating?.message} />
          <div className="flex gap-4 items-end">
            <Button type="submit" disabled={mutation.isPending}>
              {isEditing ? 'Update Testimonial' : 'Add Testimonial'}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => { setIsEditing(null); form.reset(); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {testimonials?.map((t: any) => (
          <div key={t.id} className="p-6 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div className="flex gap-4 items-center">
              <img src={t.photo || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-primary">{t.studentName}</p>
                <p className="text-sm text-secondary">{t.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                setIsEditing(t.id);
                form.reset({ ...t });
              }}>
                <Edit3 size={16} />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate(t.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsManager;
