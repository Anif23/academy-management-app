import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(['Trainer', 'Developer', 'Designer', 'Video Editor', 'Digital Marketing', 'Counsellor'], {
    errorMap: () => ({ message: 'Select an employee type.' }),
  }),
  email: z.string().email('Enter a valid email address.'),
  phone: z
    .string()
    .min(10, 'Enter a valid 10-digit phone number.')
    .max(10, 'Enter a valid 10-digit phone number.')
    .regex(/^\d+$/, 'Phone number must contain digits only.'),
  status: z.enum(['Active', 'Inactive']),
  joiningDate: z.string().min(1, 'Joining date is required.'),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
