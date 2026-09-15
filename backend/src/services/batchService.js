const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { BatchStatusMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

function toPublic(batch) {
  return {
    id: batch.id,
    batchId: batch.batchCode,
    course: batch.course?.name,
    courseId: batch.courseId,
    name: batch.name,
    startDate: batch.startDate,
    endDate: batch.endDate,
    classTiming: batch.classTiming,
    days: batch.days,
    trainerId: batch.trainerId,
    studentIds: (batch.students || []).map((s) => s.id),
    status: BatchStatusMap.fromDb(batch.status),
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  };
}

const includeRelations = { course: true, students: { select: { id: true } } };

async function getAll(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = {
    ...(query.search
      ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { batchCode: { contains: query.search, mode: 'insensitive' } }] }
      : {}),
    ...(query.status ? { status: BatchStatusMap.toDb(query.status) } : {}),
    ...(query.course ? { course: { name: query.course } } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.batch.findMany({ where, skip, take, include: includeRelations, orderBy: { createdAt: 'desc' } }),
    prisma.batch.count({ where }),
  ]);

  return buildPaginatedResult(rows.map(toPublic), total, page, pageSize);
}

async function getAllRaw() {
  const rows = await prisma.batch.findMany({ include: includeRelations, orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function getById(id) {
  const batch = await prisma.batch.findUnique({ where: { id }, include: includeRelations });
  if (!batch) throw ApiError.notFound('Batch not found.');
  return toPublic(batch);
}

async function create(input) {
  const batch = await prisma.batch.create({
    data: {
      batchCode: input.batchId,
      courseId: input.courseId,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      classTiming: input.classTiming,
      days: input.days,
      trainerId: input.trainerId,
      status: BatchStatusMap.toDb(input.status),
    },
    include: includeRelations,
  });
  return toPublic(batch);
}

async function update(id, patch) {
  const data = {};
  if (patch.batchId !== undefined) data.batchCode = patch.batchId;
  if (patch.courseId !== undefined) data.courseId = patch.courseId;
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.startDate !== undefined) data.startDate = patch.startDate;
  if (patch.endDate !== undefined) data.endDate = patch.endDate;
  if (patch.classTiming !== undefined) data.classTiming = patch.classTiming;
  if (patch.days !== undefined) data.days = patch.days;
  if (patch.trainerId !== undefined) data.trainerId = patch.trainerId;
  if (patch.status !== undefined) data.status = BatchStatusMap.toDb(patch.status);

  const batch = await prisma.batch.update({ where: { id }, data, include: includeRelations });
  return toPublic(batch);
}

async function getByCourseId(courseId) {
  const rows = await prisma.batch.findMany({
    where: { courseId },
    include: includeRelations,
    orderBy: { startDate: 'asc' },
  });
  return rows.map(toPublic);
}

module.exports = { getAll, getAllRaw, getById, getByCourseId, create, update, toPublic };
