const prisma = require('../config/prisma');

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

async function getAllRaw() {
  const rows = await prisma.performance.findMany({ orderBy: { date: 'desc' } });
  return rows.map(toPublic);
}

async function getByStudent(studentId) {
  const rows = await prisma.performance.findMany({ where: { studentId }, orderBy: { date: 'desc' } });
  return rows.map(toPublic);
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

module.exports = { getAllRaw, getByStudent, create, update, remove, computeOverall };
