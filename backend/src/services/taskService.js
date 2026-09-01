const crypto = require('crypto');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { TaskPriorityMap, TaskStatusMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

function toPublic(task) {
  return {
    id: task.id,
    studentId: task.studentId,
    batchId: task.batchId,
    batchAssignmentId: task.batchAssignmentId,
    title: task.title,
    description: task.description,
    assignedDate: task.assignedDate,
    dueDate: task.dueDate,
    priority: TaskPriorityMap.fromDb(task.priority),
    status: TaskStatusMap.fromDb(task.status),
    trainerRemarks: task.trainerRemarks || '',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

async function getAll(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = {
    ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    ...(query.status ? { status: TaskStatusMap.toDb(query.status) } : {}),
    ...(query.priority ? { priority: TaskPriorityMap.toDb(query.priority) } : {}),
    ...(query.studentId ? { studentId: query.studentId } : {}),
    ...(query.batchId ? { batchId: query.batchId } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.task.count({ where }),
  ]);

  return buildPaginatedResult(rows.map(toPublic), total, page, pageSize);
}

async function getAllRaw() {
  const rows = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function getByStudent(studentId) {
  const rows = await prisma.task.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function create(input) {
  const task = await prisma.task.create({
    data: {
      studentId: input.studentId,
      title: input.title,
      description: input.description,
      assignedDate: input.assignedDate,
      dueDate: input.dueDate,
      priority: TaskPriorityMap.toDb(input.priority),
      status: TaskStatusMap.toDb(input.status),
      trainerRemarks: input.trainerRemarks,
    },
  });
  return toPublic(task);
}

/**
 * Fans a single batch-wide task assignment out into one real Task row per
 * currently-active student in that batch, all sharing a batchAssignmentId
 * so the UI can group them, while each student's progress (status,
 * remarks) is tracked completely independently from that point on.
 */
async function createBatchTask(input) {
  const students = await prisma.student.findMany({
    where: { batchId: input.batchId, status: 'ACTIVE' },
    select: { id: true },
  });

  if (students.length === 0) {
    throw ApiError.badRequest('This batch has no active students to assign the task to.', 'BATCH_EMPTY');
  }

  const batchAssignmentId = crypto.randomUUID();

  await prisma.task.createMany({
    data: students.map((s) => ({
      studentId: s.id,
      batchId: input.batchId,
      batchAssignmentId,
      title: input.title,
      description: input.description,
      assignedDate: input.assignedDate,
      dueDate: input.dueDate,
      priority: TaskPriorityMap.toDb(input.priority),
      status: TaskStatusMap.toDb(input.status),
      trainerRemarks: input.trainerRemarks,
    })),
  });

  const created = await prisma.task.findMany({ where: { batchAssignmentId } });
  return created.map(toPublic);
}

async function update(id, patch) {
  const data = { ...patch };
  if (data.priority) data.priority = TaskPriorityMap.toDb(data.priority);
  if (data.status) data.status = TaskStatusMap.toDb(data.status);

  const task = await prisma.task.update({ where: { id }, data });
  return toPublic(task);
}

async function remove(id) {
  await prisma.task.delete({ where: { id } });
}

module.exports = { getAll, getAllRaw, getByStudent, create, createBatchTask, update, remove };
