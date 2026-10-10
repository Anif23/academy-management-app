const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { invalidate } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');
const { CourseStatusMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

function toPublic(course) {
  return {
    id: course.id,
    name: course.name,
    duration: course.duration,
    fee: Number(course.fee),
    description: course.description || '',
    status: CourseStatusMap.fromDb(course.status),
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

async function getAll(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = query.search
    ? { name: { contains: query.search, mode: 'insensitive' } }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.course.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.course.count({ where }),
  ]);

  return buildPaginatedResult(rows.map(toPublic), total, page, pageSize);
}

async function getAllRaw() {
  const rows = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function getById(id) {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw ApiError.notFound('Course not found.');
  return toPublic(course);
}

async function create(input) {
  const course = await prisma.course.create({
    data: {
      name: input.name,
      duration: input.duration,
      fee: input.fee,
      description: input.description,
      status: CourseStatusMap.toDb(input.status),
    },
  });
  await invalidate(CACHE_KEYS.publicCourses, CACHE_KEYS.academyStats);
  return toPublic(course);
}

async function update(id, patch) {
  const data = { ...patch };
  if (data.status) data.status = CourseStatusMap.toDb(data.status);

  const course = await prisma.course.update({ where: { id }, data });
  await invalidate(CACHE_KEYS.publicCourses, CACHE_KEYS.academyStats);
  return toPublic(course);
}

async function remove(id) {
  const [studentCount, batchCount] = await Promise.all([
    prisma.student.count({ where: { courseId: id } }),
    prisma.batch.count({ where: { courseId: id } }),
  ]);

  if (studentCount > 0 || batchCount > 0) {
    throw ApiError.conflict('Cannot delete a course that has students or batches assigned to it. Mark it Inactive instead.', 'COURSE_IN_USE');
  }

  await prisma.course.delete({ where: { id } });
  await invalidate(CACHE_KEYS.publicCourses, CACHE_KEYS.academyStats);
}

module.exports = { getAll, getAllRaw, getById, create, update, remove, toPublic };
