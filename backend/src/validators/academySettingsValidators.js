const { z } = require('zod');

// Blank string is explicitly allowed (means "not set" / "clear this
// field") — only a non-empty value must be a real URL.
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: 'Must be a valid http(s) URL.' });

const updateAcademySettingsSchema = z.object({
  name: z.string().trim().min(1, 'Academy name is required.').optional(),
  logoUrl: z.string().trim().optional(),
  email: z.string().trim().email('Enter a valid email.').optional(),
  phone: z.string().trim().min(1, 'Phone is required.').optional(),
  whatsapp: z.string().trim().min(1, 'WhatsApp number is required.').optional(),
  address: z.string().trim().min(1, 'Address is required.').optional(),
  city: z.string().trim().min(1, 'City is required.').optional(),
  state: z.string().trim().min(1, 'State is required.').optional(),
  country: z.string().trim().min(1, 'Country is required.').optional(),
  description: z.string().trim().max(2000).optional(),
  mission: z.string().trim().max(1000).optional(),
  vision: z.string().trim().max(1000).optional(),
  workingHours: z.string().trim().max(200).optional(),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  twitterUrl: optionalUrl,
  // Shown in the footer and the Privacy Policy — the registered business
  // name/number and a real contact for data-protection grievances (DPDP Act).
  legalName: z.string().trim().max(200).optional().or(z.literal('')),
  registrationNumber: z.string().trim().max(60).optional().or(z.literal('')),
  grievanceOfficerName: z.string().trim().max(120).optional().or(z.literal('')),
  grievanceOfficerEmail: z.string().trim().email('Enter a valid email.').optional().or(z.literal('')),
  grievanceOfficerPhone: z.string().trim().max(30).optional().or(z.literal('')),
});

module.exports = { updateAcademySettingsSchema };
