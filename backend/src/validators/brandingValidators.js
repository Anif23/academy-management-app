const { z } = require('zod');

const updateBrandingSchema = z.object({
  appName: z.string().trim().min(2, 'App name must be at least 2 characters.').max(40).optional(),
  tagline: z.string().trim().max(60).optional(),
  logoUrl: z.string().trim().optional(),
});

module.exports = { updateBrandingSchema };
