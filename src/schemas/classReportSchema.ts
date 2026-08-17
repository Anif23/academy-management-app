import { z } from 'zod';

export const classReportSchema = z.object({
  date: z.string().min(1, 'Date is required.'),
  batchId: z.string().min(1, 'Select a batch.'),
  trainerId: z.string().min(1, 'Select a trainer.'),
  topic: z.string().min(2, 'Topic is required.'),
  module: z.string().min(1, 'Module is required.'),
  description: z.string().min(5, 'Description is required.'),
  tasksGiven: z.string().optional().default(''),
  taskStatus: z.enum(['Not Given', 'Given', 'Reviewed']),
  studentPerformance: z.string().optional().default(''),
  remarks: z.string().optional().default(''),
  nextClassPlan: z.string().optional().default(''),
});

export type ClassReportFormValues = z.infer<typeof classReportSchema>;
