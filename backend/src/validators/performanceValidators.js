const { z } = require('zod');

const score = z.coerce.number().min(0, 'Minimum score is 0.').max(10, 'Maximum score is 10.');

const createPerformanceSchema = z.object({
  studentId: z.string().min(1, 'Select a student.'),
  date: z.coerce.date(),
  technicalKnowledge: score,
  practicalSkills: score,
  communication: score,
  attendance: score,
  taskCompletion: score,
  behaviour: score,
  remarks: z.string().trim().optional().default(''),
});

const updatePerformanceSchema = createPerformanceSchema.partial();

module.exports = { createPerformanceSchema, updatePerformanceSchema };
