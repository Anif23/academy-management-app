import { z } from 'zod';

export const taskSchema = z
  .object({
    studentId: z.string().min(1, 'Select a student.'),
    title: z.string().min(2, 'Task title is required.'),
    description: z.string().min(5, 'Description is required.'),
    assignedDate: z.string().min(1, 'Assigned date is required.'),
    dueDate: z.string().min(1, 'Due date is required.'),
    priority: z.enum(['Low', 'Medium', 'High']),
    status: z.enum(['Pending', 'In Progress', 'Completed']),
    trainerRemarks: z.string().optional().default(''),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.assignedDate), {
    message: 'Due date must be on or after the assigned date.',
    path: ['dueDate'],
  });

export type TaskFormValues = z.infer<typeof taskSchema>;

export const batchTaskSchema = z
  .object({
    batchId: z.string().min(1, 'Select a batch.'),
    title: z.string().min(2, 'Task title is required.'),
    description: z.string().min(5, 'Description is required.'),
    assignedDate: z.string().min(1, 'Assigned date is required.'),
    dueDate: z.string().min(1, 'Due date is required.'),
    priority: z.enum(['Low', 'Medium', 'High']),
    status: z.enum(['Pending', 'In Progress', 'Completed']),
    trainerRemarks: z.string().optional().default(''),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.assignedDate), {
    message: 'Due date must be on or after the assigned date.',
    path: ['dueDate'],
  });

export type BatchTaskFormValues = z.infer<typeof batchTaskSchema>;
