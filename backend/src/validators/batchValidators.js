const { z } = require('zod');
const { BatchStatusMap } = require('../utils/enumMaps');

const createBatchSchema = z
  .object({
    batchId: z.string().trim().min(2, 'Batch ID is required.'),
    courseId: z.string().min(1, 'Select a course.'),
    name: z.string().trim().min(2, 'Batch name is required.'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    classTiming: z.string().trim().min(1, 'Class timing is required.'),
    days: z.array(z.string()).min(1, 'Select at least one class day.'),
    trainerId: z.string().min(1, 'Select a trainer.'),
    status: z.enum(BatchStatusMap.labels()).default('Upcoming'),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after the start date.',
    path: ['endDate'],
  });

const updateBatchSchema = z.object({
  batchId: z.string().trim().min(2).optional(),
  courseId: z.string().min(1).optional(),
  name: z.string().trim().min(2).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  classTiming: z.string().trim().min(1).optional(),
  days: z.array(z.string()).min(1).optional(),
  trainerId: z.string().min(1).optional(),
  status: z.enum(BatchStatusMap.labels()).optional(),
});

module.exports = { createBatchSchema, updateBatchSchema };
