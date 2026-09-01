const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { ClassReportTaskStatusMap } = require('../utils/enumMaps');
const attendanceService = require('./attendanceService');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

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

async function withAttendance(report) {
  const attendance = await attendanceService.computeClassAttendance(report.batchId, report.date);
  return { ...toPublic(report), attendance };
}

async function getAll(query) {
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

  const [rows, total] = await Promise.all([
    prisma.classReport.findMany({ where, skip, take, orderBy: { date: 'desc' } }),
    prisma.classReport.count({ where }),
  ]);

  const data = await Promise.all(rows.map(withAttendance));
  return buildPaginatedResult(data, total, page, pageSize);
}

async function getAllRaw() {
  const rows = await prisma.classReport.findMany({ orderBy: { date: 'desc' } });
  return Promise.all(rows.map(withAttendance));
}

async function getById(id) {
  const report = await prisma.classReport.findUnique({ where: { id } });
  if (!report) throw ApiError.notFound('Class report not found.');
  return withAttendance(report);
}

async function create(input) {
  const report = await prisma.classReport.create({
    data: {
      date: input.date,
      batchId: input.batchId,
      trainerId: input.trainerId,
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
