const { z } = require('zod');
const { PaymentModeMap } = require('../utils/enumMaps');

const updateFeeSchema = z.object({
  courseFee: z.coerce.number().min(0, 'Course fee must be a positive number.').optional(),
  discount: z.coerce.number().min(0, 'Discount cannot be negative.').optional(),
  nextPaymentDate: z.coerce.date().optional().nullable(),
  remarks: z.string().trim().optional(),
});

const addPaymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Enter an amount greater than zero.'),
  date: z.coerce.date(),
  mode: z.enum(PaymentModeMap.labels()),
  remarks: z.string().trim().optional().default(''),
});

module.exports = { updateFeeSchema, addPaymentSchema };
