const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['ADMIN', 'STAFF', 'STUDENT']).default('STUDENT'),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  department: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit phone number.')
    .optional(),
});

module.exports = { loginSchema, registerSchema, updateProfileSchema };
