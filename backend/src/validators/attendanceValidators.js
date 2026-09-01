const { z } = require('zod');
const { AttendanceStatusMap } = require('../utils/enumMaps');

const markBulkAttendanceSchema = z.object({
  batchId: z.string().min(1, 'Select a batch.'),
  date: z.coerce.date(),
  marks: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: z.enum(AttendanceStatusMap.labels()),
      }),
    )
    .min(1, 'No students to mark.'),
});

module.exports = { markBulkAttendanceSchema };
