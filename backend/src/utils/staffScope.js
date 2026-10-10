const prisma = require('../config/prisma');

/**
 * A STAFF (trainer) account should only ever see the batches assigned to
 * them, and by extension the students in those batches — never the whole
 * academy. These helpers are the single source of truth for that scoping,
 * used across students/batches/attendance/class reports/performance so the
 * rule can't drift between modules.
 */

async function getStaffBatchIds(employeeId) {
  if (!employeeId) return [];
  const batches = await prisma.batch.findMany({ where: { trainerId: employeeId }, select: { id: true } });
  return batches.map((b) => b.id);
}

/**
 * A staff member "owns" a student two ways, not just one: as the trainer
 * of the batch the student is in, OR as the counsellor who's handling
 * that student's admission/relationship. A counsellor's students often
 * aren't even in a batch yet (fresh admission), so batch-only scoping
 * would wrongly hide them.
 */
async function getStaffStudentIds(employeeId) {
  const batchIds = await getStaffBatchIds(employeeId);
  const students = await prisma.student.findMany({
    where: { OR: [{ batchId: { in: batchIds } }, { counsellorId: employeeId }] },
    select: { id: true },
  });
  return students.map((s) => s.id);
}

/** Is this specific batch one this staff member is the trainer for? */
async function staffOwnsBatch(employeeId, batchId) {
  if (!batchId) return false;
  const batch = await prisma.batch.findUnique({ where: { id: batchId }, select: { trainerId: true } });
  return Boolean(batch && batch.trainerId === employeeId);
}

/** Is this student in one of this staff member's batches, or are they the student's counsellor? */
async function staffOwnsStudent(employeeId, studentId) {
  if (!studentId) return false;
  const student = await prisma.student.findUnique({ where: { id: studentId }, select: { batchId: true, counsellorId: true } });
  if (!student) return false;
  if (student.counsellorId === employeeId) return true;
  if (!student.batchId) return false;
  return staffOwnsBatch(employeeId, student.batchId);
}

module.exports = { getStaffBatchIds, getStaffStudentIds, staffOwnsBatch, staffOwnsStudent };
