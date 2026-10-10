const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { ClassReportTaskStatusMap } = require('../utils/enumMaps');
const attendanceService = require('./attendanceService');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');
const { getStaffBatchIds } = require('../utils/staffScope');
const { isScopedRole } = require('../constants/roles');

function toPublic(report) {
  return {
    id: report.id,
    date: report.date,
    batchId: report.batchId,
    trainerId: report.trainerId,
    topic: report.topic,
    module: report.module,
    description: report.description,
    tasksGiven: report.tasksGiven || '',
    taskStatus: ClassReportTaskStatusMap.fromDb(report.taskStatus),
    studentPerformance: report.studentPerformance || '',
    remarks: report.remarks || '',
    nextClassPlan: report.nextClassPlan || '',
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

/**
 * Attaches each report's attendance summary in two queries total, not two
 * queries per report. `withAttendance` (kept for the single-report case)
 * did one `computeClassAttendance` call per row, which meant a 20-row page
 * of class reports fired ~40 extra database round trips.
 */
async function attachAttendance(reports) {
  if (reports.length === 0) return [];

  const batchIds = [...new Set(reports.map((r) => r.batchId))];

  const [records, students] = await Promise.all([
    prisma.attendance.findMany({ where: { batchId: { in: batchIds }, date: { in: reports.map((r) => r.date) } } }),
    prisma.student.findMany({ where: { batchId: { in: batchIds } }, select: { batchId: true, joiningDate: true } }),
  ]);

  const keyOf = (batchId, date) => `${batchId}::${new Date(date).toISOString()}`;

  return reports.map((report) => {
    const reportKey = keyOf(report.batchId, report.date);
    // Both `batchId` and `date` must match — records were fetched across
    // every batch in this page, so matching on date alone would wrongly
    // credit a report with another batch's attendance from the same day.
    const attendanceForReport = records.filter((r) => keyOf(r.batchId, r.date) === reportKey);
    const eligibleCount = students.filter(
      (s) => s.batchId === report.batchId && new Date(s.joiningDate).getTime() <= new Date(report.date).getTime(),
    ).length;

    return {
      ...toPublic(report),
      attendance: {
        present: attendanceForReport.filter((r) => r.status === 'PRESENT').length,
        total: eligibleCount,
        marked: attendanceForReport.length > 0,
      },
    };
  });
}

async function withAttendance(report) {
  const attendance = await attendanceService.computeClassAttendance(report.batchId, report.date);
  return { ...toPublic(report), attendance };
}

async function getAll(query, actor) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = {
    ...(query.search
      ? {
          OR: [
            { topic: { contains: query.search, mode: 'insensitive' } },
            { module: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(query.batchId ? { batchId: query.batchId } : {}),
  };

  // A trainer only ever sees/reports on their own assigned batches.
  if (isScopedRole(actor?.role)) {
    const allowedBatchIds = await getStaffBatchIds(actor.employeeId);
    if (query.batchId) {
      if (!allowedBatchIds.includes(query.batchId)) {
        return buildPaginatedResult([], 0, page, pageSize);
      }
    } else {
      where.batchId = { in: allowedBatchIds };
    }
  }

  const [rows, total] = await Promise.all([
    prisma.classReport.findMany({ where, skip, take, orderBy: { date: 'desc' } }),
    prisma.classReport.count({ where }),
  ]);

  const data = await attachAttendance(rows);
  return buildPaginatedResult(data, total, page, pageSize);
}

async function getAllRaw() {
  const rows = await prisma.classReport.findMany({ orderBy: { date: 'desc' } });
  return attachAttendance(rows);
}

async function getById(id) {
  const report = await prisma.classReport.findUnique({ where: { id } });
  if (!report) throw ApiError.notFound('Class report not found.');
  return withAttendance(report);
}

/**
 * `trainerId` is never trusted from client input for a STAFF caller — it's
 * always forced to their own employeeId, so a trainer can't file a report
 * under someone else's name. Admin may still specify any trainerId
 * (e.g. filing on behalf of someone), since they have academy-wide access.
 */
async function create(input, actor) {
  const trainerId = isScopedRole(actor?.role) ? actor.employeeId : input.trainerId;

  const report = await prisma.classReport.create({
    data: {
      date: input.date,
      batchId: input.batchId,
      trainerId,
      topic: input.topic,
      module: input.module,
      description: input.description,
      tasksGiven: input.tasksGiven,
      taskStatus: ClassReportTaskStatusMap.toDb(input.taskStatus),
      studentPerformance: input.studentPerformance,
      remarks: input.remarks,
      nextClassPlan: input.nextClassPlan,
    },
  });
  return withAttendance(report);
}

async function update(id, patch) {
  const data = { ...patch };
  if (data.taskStatus) data.taskStatus = ClassReportTaskStatusMap.toDb(data.taskStatus);

  const report = await prisma.classReport.update({ where: { id }, data });
  return withAttendance(report);
}

async function remove(id) {
  await prisma.classReport.delete({ where: { id } });
}

module.exports = { getAll, getAllRaw, getById, create, update, remove };
