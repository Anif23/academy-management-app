const { z } = require('zod');
const { TaskPriorityMap } = require('../utils/enumMaps');

const fileRefSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().nonnegative(),
});

const createTaskSchema = z
  .object({
    title: z.string().trim().min(2, 'Task title is required.'),
    description: z.string().trim().min(5, 'Description is required.'),
    assignedDate: z.coerce.date(),
    dueDate: z.coerce.date(),
    priority: z.enum(TaskPriorityMap.labels()).default('Medium'),
    // Exactly one of these — enforced by the refine below.
    studentId: z.string().min(1).optional(),
    batchId: z.string().min(1).optional(),
    attachments: z.array(fileRefSchema).max(10).optional().default([]),
  })
  .refine((data) => Boolean(data.studentId) !== Boolean(data.batchId), {
    message: 'Assign the task to either one student or one batch, not both/neither.',
    path: ['studentId'],
  })
  .refine((data) => data.dueDate >= data.assignedDate, {
    message: 'Due date must be on or after the assigned date.',
    path: ['dueDate'],
  });

const updateTaskSchema = z.object({
  title: z.string().trim().min(2).optional(),
  description: z.string().trim().min(5).optional(),
  assignedDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(TaskPriorityMap.labels()).optional(),
});

const submitTaskSchema = z
  .object({
    content: z.string().trim().max(20000).optional().default(''),
    files: z.array(fileRefSchema).max(10).optional().default([]),
  })
  .refine((data) => data.content.length > 0 || data.files.length > 0, {
    message: 'Add a comment or at least one file before submitting.',
    path: ['content'],
  });

const reviewSubmissionSchema = z.object({
  decision: z.enum(['approve', 'needs_revision']),
  feedback: z.string().trim().max(4000).optional().default(''),
});

module.exports = { createTaskSchema, updateTaskSchema, submitTaskSchema, reviewSubmissionSchema };
