const prisma = require('../config/prisma');
const { AttendanceStatusMap } = require('../utils/enumMaps');

function toPublic(record) {
  return {
    id: record.id,
    studentId: record.studentId,
    batchId: record.batchId,
    date: record.date,
    status: AttendanceStatusMap.fromDb(record.status),
    createdAt: record.createdAt,
  };
}

async function getByStudent(studentId) {
  const rows = await prisma.attendance.findMany({ where: { studentId }, orderBy: { date: 'desc' } });
  return rows.map(toPublic);
}

async function getByBatchAndDate(batchId, date) {
  const rows = await prisma.attendance.findMany({ where: { batchId, date } });
  return rows.map(toPublic);
}

async function getAllRaw() {
  const rows = await prisma.attendance.findMany({ orderBy: { date: 'desc' } });
  return rows.map(toPublic);
}

/**
 * A student can only be marked (or counted) for a class held on or after
 * the day they actually joined — mirrors the same rule the registration
 * date enforces everywhere else in the app.
 */
async function getEligibleStudents(batchId, date) {
  return prisma.student.findMany({
    where: { batchId, joiningDate: { lte: date } },
  });
}

async function markBulk(batchId, date, marks) {
  await prisma.$transaction([
    prisma.attendance.deleteMany({ where: { batchId, date } }),
    prisma.attendance.createMany({
      data: marks.map((m) => ({
        studentId: m.studentId,
        batchId,
        date,
        status: AttendanceStatusMap.toDb(m.status),
      })),
    }),
  ]);

  return getByBatchAndDate(batchId, date);
}

function summarize(records) {
  const total = records.length;
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const leave = records.filter((r) => r.status === 'Leave').length;
  return { total, present, absent, leave, percentage: total ? Math.round((present / total) * 100) : 0 };
}

/**
 * Used by Class Reports so trainers don't have to type in a present/total
 * count that duplicates what's already recorded in the Attendance module.
 */
async function computeClassAttendance(batchId, date) {
  const [records, eligibleStudents] = await Promise.all([
    prisma.attendance.findMany({ where: { batchId, date } }),
    getEligibleStudents(batchId, date),
  ]);

  return {
    present: records.filter((r) => r.status === 'PRESENT').length,
    total: eligibleStudents.length,
    marked: records.length > 0,
  };
}

module.exports = { getByStudent, getByBatchAndDate, getAllRaw, getEligibleStudents, markBulk, summarize, computeClassAttendance, toPublic };
