import { z } from 'zod';

export const walkInSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  mobile: z
    .string()
    .min(10, 'Enter a valid 10-digit mobile number.')
    .max(10, 'Enter a valid 10-digit mobile number.')
    .regex(/^\d+$/, 'Mobile number must contain digits only.'),
  email: z.string().email('Enter a valid email address.'),
  courseInterested: z.string().min(1, 'Select a course.'),
  qualification: z.string().min(2, 'Qualification is required.'),
  location: z.string().min(2, 'Location is required.'),
  source: z.enum(['Walk-in', 'Website', 'Google', 'Instagram', 'Referral']),
  counsellorId: z.string().min(1, 'Select a counsellor.'),
  enquiryDate: z.string().min(1, 'Enquiry date is required.'),
  remarks: z.string().optional().default(''),
  followUpDate: z.string().optional().default(''),
  status: z.enum(['New', 'Contacted', 'Counselling', 'Interested', 'Admission', 'Not Interested']),
});

export type WalkInFormValues = z.infer<typeof walkInSchema>;
