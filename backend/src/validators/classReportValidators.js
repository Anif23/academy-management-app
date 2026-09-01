const { z } = require('zod');
const { ClassReportTaskStatusMap } = require('../utils/enumMaps');

const createClassReportSchema = z.object({
  date: z.coerce.date(),
  batchId: z.string().min(1, 'Select a batch.'),
  trainerId: z.string().min(1, 'Select a trainer.'),
  topic: z.string().trim().min(2, 'Topic is required.'),
  module: z.string().trim().min(1, 'Module is required.'),
  description: z.string().trim().min(5, 'Description is required.'),
  tasksGiven: z.string().trim().optional().default(''),
  taskStatus: z.enum(ClassReportTaskStatusMap.labels()).default('Given'),
  studentPerformance: z.string().trim().optional().default(''),
  remarks: z.string().trim().optional().default(''),
  nextClassPlan: z.string().trim().optional().default(''),
});

const updateClassReportSchema = createClassReportSchema.partial();

module.exports = { createClassReportSchema, updateClassReportSchema };
