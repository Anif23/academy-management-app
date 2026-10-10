const { z } = require('zod');
const { ActiveInactiveMap } = require('../utils/enumMaps');

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['ADMIN', 'STAFF', 'COUNSELLOR', 'STUDENT']),
  department: z.string().trim().optional().default(''),
  phone: z.string().trim().optional().default(''),
  employeeId: z.string().optional(),
  studentId: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  role: z.enum(['ADMIN', 'STAFF', 'COUNSELLOR', 'STUDENT']).optional(),
  department: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  status: z.enum(ActiveInactiveMap.labels()).optional(),
});

module.exports = { createUserSchema, updateUserSchema };
