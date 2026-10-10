const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { getStaffStudentIds } = require('../utils/staffScope');
const { isScopedRole } = require('../constants/roles');

function computeOverall(record) {
  const { technicalKnowledge, practicalSkills, communication, attendance, taskCompletion, behaviour } = record;
  const avg = (technicalKnowledge + practicalSkills + communication + attendance + taskCompletion + behaviour) / 6;
  return Math.round(avg * 10) / 10;
}

function toPublic(record) {
  const plain = {
    id: record.id,
    studentId: record.studentId,
    date: record.date,
    technicalKnowledge: record.technicalKnowledge,
    practicalSkills: record.practicalSkills,
    communication: record.communication,
    attendance: record.attendance,
    taskCompletion: record.taskCompletion,
    behaviour: record.behaviour,
    remarks: record.remarks || '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
  return { ...plain, overall: computeOverall(plain) };
}

async function getAllRaw(actor) {
  let where = {};
  if (isScopedRole(actor?.role)) {
    const allowedStudentIds = await getStaffStudentIds(actor.employeeId);
    where = { studentId: { in: allowedStudentIds } };
  }
  const rows = await prisma.performance.findMany({ where, orderBy: { date: 'desc' } });
  return rows.map(toPublic);
}

async function getByStudent(studentId) {
  const rows = await prisma.performance.findMany({ where: { studentId }, orderBy: { date: 'desc' } });
  return rows.map(toPublic);
}

async function getById(id) {
  const record = await prisma.performance.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('Performance record not found.');
  return toPublic(record);
}

async function create(input) {
  const record = await prisma.performance.create({ data: input });
  return toPublic(record);
}

async function update(id, patch) {
  const record = await prisma.performance.update({ where: { id }, data: patch });
  return toPublic(record);
}

async function remove(id) {
  await prisma.performance.delete({ where: { id } });
}

module.exports = { getAllRaw, getByStudent, getById, create, update, remove, computeOverall };
