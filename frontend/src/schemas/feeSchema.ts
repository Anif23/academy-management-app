import { z } from 'zod';

export const feeDetailsSchema = z.object({
  courseFee: z.coerce.number().min(0, 'Course fee must be a positive number.'),
  discount: z.coerce.number().min(0, 'Discount cannot be negative.'),
  nextPaymentDate: z.string().optional().default(''),
  remarks: z.string().optional().default(''),
});

export type FeeDetailsFormValues = z.infer<typeof feeDetailsSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Enter an amount greater than zero.'),
  date: z.string().min(1, 'Payment date is required.'),
  mode: z.enum(['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque']),
  remarks: z.string().optional().default(''),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
