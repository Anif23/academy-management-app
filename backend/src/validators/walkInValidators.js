const { z } = require('zod');
const { LeadSourceMap, LeadStatusMap } = require('../utils/enumMaps');

const createWalkInSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  mobile: z.string().trim().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  courseInterestedId: z.string().min(1, 'Select a course.'),
  qualification: z.string().trim().min(2, 'Qualification is required.'),
  location: z.string().trim().min(2, 'Location is required.'),
  source: z.enum(LeadSourceMap.labels()),
  counsellorId: z.string().min(1, 'Select a counsellor.'),
  enquiryDate: z.coerce.date(),
  remarks: z.string().trim().optional().default(''),
  followUpDate: z.coerce.date().optional().nullable(),
  status: z.enum(LeadStatusMap.labels()).default('New'),
});

const updateWalkInSchema = createWalkInSchema.partial();

module.exports = { createWalkInSchema, updateWalkInSchema };
