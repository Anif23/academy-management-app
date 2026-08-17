import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  photo: z.string().optional().default(''),
  mobile: z
    .string()
    .min(10, 'Enter a valid 10-digit mobile number.')
    .max(10, 'Enter a valid 10-digit mobile number.')
    .regex(/^\d+$/, 'Mobile number must contain digits only.'),
  email: z.string().email('Enter a valid email address.'),
  dob: z.string().min(1, 'Date of birth is required.'),
  gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: 'Select a gender.' }) }),
  address: z.string().min(5, 'Address is required.'),
  qualification: z.string().min(2, 'Qualification is required.'),
  course: z.string().min(1, 'Select a course.'),
  courseDuration: z.string().min(1, 'Course duration is required.'),
  joiningDate: z.string().min(1, 'Joining date is required.'),
  batchId: z.string().min(1, 'Select a batch.'),
  mode: z.enum(['Online', 'Offline', 'Hybrid']),
  counsellorId: z.string().min(1, 'Select a counsellor.'),
  status: z.enum(['Active', 'On Hold', 'Completed', 'Dropped']),
  walkInId: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
