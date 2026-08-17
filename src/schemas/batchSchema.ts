import { z } from 'zod';

export const batchSchema = z
  .object({
    batchId: z.string().min(2, 'Batch ID is required.'),
    course: z.string().min(1, 'Select a course.'),
    name: z.string().min(2, 'Batch name is required.'),
    startDate: z.string().min(1, 'Start date is required.'),
    endDate: z.string().min(1, 'End date is required.'),
    classTiming: z.string().min(1, 'Class timing is required.'),
    days: z.array(z.string()).min(1, 'Select at least one class day.'),
    trainerId: z.string().min(1, 'Select a trainer.'),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed']),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after the start date.',
    path: ['endDate'],
  });

export type BatchFormValues = z.infer<typeof batchSchema>;
