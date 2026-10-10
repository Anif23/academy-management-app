import { z } from 'zod';

const fileRefSchema = z.object({
  url: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

export const taskSchema = z
  .object({
    studentId: z.string().min(1, 'Select a student.'),
    title: z.string().min(2, 'Task title is required.'),
    description: z.string().min(5, 'Description is required.'),
    assignedDate: z.string().min(1, 'Assigned date is required.'),
    dueDate: z.string().min(1, 'Due date is required.'),
    priority: z.enum(['Low', 'Medium', 'High']),
    attachments: z.array(fileRefSchema).optional().default([]),
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
    attachments: z.array(fileRefSchema).optional().default([]),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.assignedDate), {
    message: 'Due date must be on or after the assigned date.',
    path: ['dueDate'],
  });

export type BatchTaskFormValues = z.infer<typeof batchTaskSchema>;

export const editTaskSchema = z
  .object({
    title: z.string().min(2, 'Task title is required.'),
    description: z.string().min(5, 'Description is required.'),
    assignedDate: z.string().min(1, 'Assigned date is required.'),
    dueDate: z.string().min(1, 'Due date is required.'),
    priority: z.enum(['Low', 'Medium', 'High']),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.assignedDate), {
    message: 'Due date must be on or after the assigned date.',
    path: ['dueDate'],
  });

export type EditTaskFormValues = z.infer<typeof editTaskSchema>;

export const submitTaskSchema = z
  .object({
    content: z.string().optional().default(''),
    files: z.array(fileRefSchema).optional().default([]),
  })
  .refine((data) => data.content.trim().length > 0 || data.files.length > 0, {
    message: 'Add a comment or at least one file before submitting.',
    path: ['content'],
  });

export type SubmitTaskFormValues = z.infer<typeof submitTaskSchema>;
