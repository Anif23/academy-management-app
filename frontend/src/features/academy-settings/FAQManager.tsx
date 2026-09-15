import React, { useState } from 'react';
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

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().optional(),
  order: z.coerce.number().default(0),
});

type FAQFormData = z.infer<typeof faqSchema>;

export const FAQManager = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['adminFaqs'],
    queryFn: async () => {
      const { data } = await httpClient.get('/admin/faqs');
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: FAQFormData }) => {
      if (id) {
        return httpClient.patch(`/admin/faqs/${id}`, data);
      }
      return httpClient.post('/admin/faqs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
      toastSuccess('FAQ saved successfully!');
      setIsEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => httpClient.delete(`/admin/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
      toastSuccess('FAQ removed!');
    },
  });

  const form = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
  });

  const handleSave = (data: FAQFormData) => {
    mutation.mutate({ id: isEditing ?? undefined, data });
  };

  if (isLoading) return <div className="p-8 text-center">Loading FAQs...</div>;

  return (
    <div className="space-y-12">
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-6">Add/Edit FAQ</h3>
        <form onSubmit={form.handleSubmit(handleSave)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Field label="Question" {...form.register('question')} error={form.formState.errors.question?.message} />
          </div>
          <div className="md:col-span-2">
            <Field label="Answer" {...form.register('answer')} error={form.formState.errors.answer?.message} isTextArea />
          </div>
          <Field label="Category" {...form.register('category')} />
          <Field label="Order" {...form.register('order')} type="number" />
          <div className="flex gap-4 items-end">
            <Button type="submit" disabled={mutation.isPending}>
              {isEditing ? 'Update FAQ' : 'Add FAQ'}
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
        {faqs?.map((faq: any) => (
          <div key={faq.id} className="p-6 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div className="flex-1 pr-4">
              <p className="font-bold text-primary">{faq.question}</p>
              <p className="text-sm text-secondary line-clamp-1">{faq.answer}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                setIsEditing(faq.id);
                form.reset({ ...faq });
              }}>
                <Edit3 size={16} />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate(faq.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQManager;
