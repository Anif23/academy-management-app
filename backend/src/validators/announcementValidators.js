const { z } = require('zod');

const createAnnouncementSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(280),
  link: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')).transform((v) => v || undefined),
  tag: z.string().trim().max(24).optional().or(z.literal('')).transform((v) => v || undefined),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

module.exports = { createAnnouncementSchema, updateAnnouncementSchema };
