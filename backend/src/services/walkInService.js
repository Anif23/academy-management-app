const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { LeadSourceMap, LeadStatusMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

function toPublic(walkIn) {
  return {
    id: walkIn.id,
    name: walkIn.name,
    mobile: walkIn.mobile,
    email: walkIn.email,
    courseInterested: walkIn.courseInterested?.name,
    courseInterestedId: walkIn.courseInterestedId,
    qualification: walkIn.qualification,
    location: walkIn.location,
    source: LeadSourceMap.fromDb(walkIn.source),
    counsellorId: walkIn.counsellorId,
    enquiryDate: walkIn.enquiryDate,
    remarks: walkIn.remarks || '',
    followUpDate: walkIn.followUpDate,
    status: LeadStatusMap.fromDb(walkIn.status),
    convertedStudentId: walkIn.convertedStudent?.id ?? null,
    createdAt: walkIn.createdAt,
    updatedAt: walkIn.updatedAt,
  };
}

const includeRelations = { courseInterested: true, convertedStudent: { select: { id: true } } };

async function getAll(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = {
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { mobile: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(query.status ? { status: LeadStatusMap.toDb(query.status) } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.walkIn.findMany({ where, skip, take, include: includeRelations, orderBy: { createdAt: 'desc' } }),
    prisma.walkIn.count({ where }),
  ]);

  return buildPaginatedResult(rows.map(toPublic), total, page, pageSize);
}

async function getAllRaw() {
  const rows = await prisma.walkIn.findMany({ include: includeRelations, orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function getById(id) {
  const walkIn = await prisma.walkIn.findUnique({ where: { id }, include: includeRelations });
  if (!walkIn) throw ApiError.notFound('Walk-in not found.');
  return toPublic(walkIn);
}

async function create(input) {
  const walkIn = await prisma.walkIn.create({
    data: {
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      courseInterestedId: input.courseInterestedId,
      qualification: input.qualification,
      location: input.location,
      source: LeadSourceMap.toDb(input.source),
      counsellorId: input.counsellorId,
      enquiryDate: input.enquiryDate,
      remarks: input.remarks,
      followUpDate: input.followUpDate,
      status: LeadStatusMap.toDb(input.status),
    },
    include: includeRelations,
  });
  return toPublic(walkIn);
}

async function update(id, patch) {
  const existing = await prisma.walkIn.findUnique({ where: { id }, include: { convertedStudent: true } });
  if (!existing) throw ApiError.notFound('Walk-in not found.');

  // If this walk-in was already converted into a student and its status is
  // now being changed away from "Admission", treat that as voiding the
  // admission: delete the student. The database's ON DELETE CASCADE rules
  // on fees/attendance/tasks/performance take care of the rest.
  if (existing.convertedStudent && patch.status && patch.status !== 'Admission') {
    await prisma.student.delete({ where: { id: existing.convertedStudent.id } });
  }

  const data = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.mobile !== undefined) data.mobile = patch.mobile;
  if (patch.email !== undefined) data.email = patch.email;
  if (patch.courseInterestedId !== undefined) data.courseInterestedId = patch.courseInterestedId;
  if (patch.qualification !== undefined) data.qualification = patch.qualification;
  if (patch.location !== undefined) data.location = patch.location;
  if (patch.source !== undefined) data.source = LeadSourceMap.toDb(patch.source);
  if (patch.counsellorId !== undefined) data.counsellorId = patch.counsellorId;
  if (patch.enquiryDate !== undefined) data.enquiryDate = patch.enquiryDate;
  if (patch.remarks !== undefined) data.remarks = patch.remarks;
  if (patch.followUpDate !== undefined) data.followUpDate = patch.followUpDate;
  if (patch.status !== undefined) data.status = LeadStatusMap.toDb(patch.status);

  const walkIn = await prisma.walkIn.update({ where: { id }, data, include: includeRelations });
  return toPublic(walkIn);
}

async function remove(id) {
  await prisma.walkIn.delete({ where: { id } });
}

module.exports = { getAll, getAllRaw, getById, create, update, remove, toPublic };
