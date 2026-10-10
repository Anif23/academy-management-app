const { z } = require('zod');

// Only these folders are allowed — an arbitrary client-supplied prefix
// would let a caller scatter objects anywhere in the bucket.
const ALLOWED_FOLDERS = [
  'task-attachments', // trainer reference files on a Task
  'submission-files', // student-uploaded images/videos on a TaskSubmission
  'student-photos',
  'course-images',
  'testimonial-photos',
  'misc',
];

const presignUploadSchema = z.object({
  folder: z.enum(ALLOWED_FOLDERS, { message: 'Unsupported upload destination.' }),
  fileName: z.string().trim().min(1, 'File name is required.'),
  fileType: z.string().trim().min(1, 'File type is required.'),
  // Client reports the size up front purely so we can reject an
  // obviously-too-large file before issuing a presigned URL at all; the
  // authoritative limit is still enforced by the bucket policy.
  fileSize: z.coerce.number().int().positive('File size must be a positive number.'),
});

module.exports = { presignUploadSchema, ALLOWED_FOLDERS };
