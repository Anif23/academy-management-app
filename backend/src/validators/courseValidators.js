const { z } = require('zod');
const { CourseStatusMap } = require('../utils/enumMaps');

const createCourseSchema = z.object({
  name: z.string().trim().min(2, 'Course name is required.'),
  duration: z.string().trim().min(1, 'Duration is required.'),
  fee: z.coerce.number().min(0, 'Fee must be a positive number.'),
  description: z.string().trim().optional().default(''),
  status: z.enum(CourseStatusMap.labels()).default('Active'),
});

const updateCourseSchema = createCourseSchema.partial();

module.exports = { createCourseSchema, updateCourseSchema };
