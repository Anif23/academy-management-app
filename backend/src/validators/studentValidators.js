const { z } = require('zod');
const { GenderMap, StudentModeMap, StudentStatusMap } = require('../utils/enumMaps');

const createStudentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  photo: z.string().trim().optional().default(''),
  mobile: z.string().trim().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  dob: z.coerce.date().optional().nullable(),
  gender: z.enum(GenderMap.labels()),
  address: z.string().trim().min(5, 'Address is required.'),
  qualification: z.string().trim().min(2, 'Qualification is required.'),
  courseId: z.string().min(1, 'Select a course.'),
  courseDuration: z.string().trim().min(1, 'Course duration is required.'),
  joiningDate: z.coerce.date(),
  batchId: z.string().min(1, 'Select a batch.'),
  mode: z.enum(StudentModeMap.labels()),
  counsellorId: z.string().min(1, 'Select a counsellor.'),
  status: z.enum(StudentStatusMap.labels()).default('Active'),
  walkInId: z.string().optional().nullable(),
});

const updateStudentSchema = createStudentSchema.partial();

module.exports = { createStudentSchema, updateStudentSchema };
