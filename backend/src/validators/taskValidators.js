const { z } = require('zod');
const { TaskPriorityMap, TaskStatusMap } = require('../utils/enumMaps');

const baseTaskFields = {
  title: z.string().trim().min(2, 'Task title is required.'),
  description: z.string().trim().min(5, 'Description is required.'),
  assignedDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  priority: z.enum(TaskPriorityMap.labels()).default('Medium'),
  status: z.enum(TaskStatusMap.labels()).default('Pending'),
  trainerRemarks: z.string().trim().optional().default(''),
};

const createTaskSchema = z
  .object({ studentId: z.string().min(1, 'Select a student.'), ...baseTaskFields })
  .refine((data) => data.dueDate >= data.assignedDate, {
    message: 'Due date must be on or after the assigned date.',
    path: ['dueDate'],
  });

const createBatchTaskSchema = z
  .object({ batchId: z.string().min(1, 'Select a batch.'), ...baseTaskFields })
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
  status: z.enum(TaskStatusMap.labels()).optional(),
  trainerRemarks: z.string().trim().optional(),
});

module.exports = { createTaskSchema, createBatchTaskSchema, updateTaskSchema };
