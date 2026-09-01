const { z } = require('zod');
const { EmployeeTypeMap, ActiveInactiveMap } = require('../utils/enumMaps');

const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(EmployeeTypeMap.labels()),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z.string().trim().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number.'),
  status: z.enum(ActiveInactiveMap.labels()).default('Active'),
  joiningDate: z.coerce.date(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

module.exports = { createEmployeeSchema, updateEmployeeSchema };
