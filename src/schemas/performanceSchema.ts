import { z } from 'zod';

const scoreField = z.coerce.number().min(1, 'Minimum score is 1.').max(10, 'Maximum score is 10.');

export const performanceSchema = z.object({
  studentId: z.string().min(1, 'Select a student.'),
  date: z.string().min(1, 'Date is required.'),
  technicalKnowledge: scoreField,
  practicalSkills: scoreField,
  communication: scoreField,
  attendance: scoreField,
  taskCompletion: scoreField,
  behaviour: scoreField,
  remarks: z.string().optional().default(''),
});

export type PerformanceFormValues = z.infer<typeof performanceSchema>;
