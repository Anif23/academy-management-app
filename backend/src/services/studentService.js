const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const { GenderMap, StudentModeMap, StudentStatusMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');
const { getStaffBatchIds } = require('../utils/staffScope');
const { isScopedRole } = require('../constants/roles');

function toPublic(student) {
  return {
    id: student.id,
    studentId: student.studentCode,
    name: student.name,
    photo: student.photo || '',
    mobile: student.mobile,
    email: student.email,
    dob: student.dob,
    gender: GenderMap.fromDb(student.gender),
    address: student.address,
    qualification: student.qualification,
    course: student.course?.name,
    courseId: student.courseId,
    courseDuration: student.courseDuration,
    joiningDate: student.joiningDate,
    batchId: student.batchId,
    mode: StudentModeMap.fromDb(student.mode),
    counsellorId: student.counsellorId,
    status: StudentStatusMap.fromDb(student.status),
    walkInId: student.walkInId,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}

const includeRelations = { course: true };

async function nextStudentCode() {
  const count = await prisma.student.count();
  return `STU-2026-${(count + 1).toString().padStart(5, '0')}`;
}

async function getAll(query, actor) {
  const { page, pageSize, skip, take } = parsePagination(query);
  // Each filter's OR-group (search text, staff scoping) is kept in its
  // own array element and combined with AND, so "matches the search" and
  // "belongs to this staff member" are never accidentally merged into one
  // OR — that would let a search match leak in students outside scope.
  const and = [];
  if (query.search) {
    and.push({
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { studentCode: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { mobile: { contains: query.search, mode: 'insensitive' } },
      ],
    });
  }

  const where = {
    ...(query.status ? { status: StudentStatusMap.toDb(query.status) } : {}),
    ...(query.course ? { course: { name: query.course } } : {}),
    ...(query.batchId ? { batchId: query.batchId } : {}),
  };

  // Staff only see students in batches assigned to them, or students
  // they're personally the counsellor for (a fresh admission may not be
  // in a batch yet) — never the whole academy roster.
  if (isScopedRole(actor?.role)) {
    const allowedBatchIds = await getStaffBatchIds(actor.employeeId);
    if (query.batchId) {
      // They asked for a specific batch — only honor it if it's theirs.
      if (!allowedBatchIds.includes(query.batchId)) {
        return buildPaginatedResult([], 0, page, pageSize);
      }
    } else {
      and.push({ OR: [{ batchId: { in: allowedBatchIds } }, { counsellorId: actor.employeeId }] });
    }
  }

  if (and.length > 0) where.AND = and;

  const [rows, total] = await Promise.all([
    prisma.student.findMany({ where, skip, take, include: includeRelations, orderBy: { createdAt: 'desc' } }),
    prisma.student.count({ where }),
  ]);

  return buildPaginatedResult(rows.map(toPublic), total, page, pageSize);
}

async function getAllRaw(actor) {
  let where = {};
  if (isScopedRole(actor?.role)) {
    const allowedBatchIds = await getStaffBatchIds(actor.employeeId);
    where = { OR: [{ batchId: { in: allowedBatchIds } }, { counsellorId: actor.employeeId }] };
  }
  const rows = await prisma.student.findMany({ where, include: includeRelations, orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function getById(id) {
  const student = await prisma.student.findUnique({ where: { id }, include: includeRelations });
  if (!student) throw ApiError.notFound('Student not found.');
  return toPublic(student);
}

async function create(input, actor) {
  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course) throw ApiError.badRequest('Selected course does not exist.', 'INVALID_COURSE');

  // A staff member registering a student is registering one for
  // themselves as counsellor — never whoever the client payload claims,
  // and never a batch they don't actually train.
  let counsellorId = input.counsellorId;
  if (isScopedRole(actor?.role)) {
    counsellorId = actor.employeeId;
    if (actor.role === 'STAFF' && input.batchId) {
      const allowedBatchIds = await getStaffBatchIds(actor.employeeId);
      if (!allowedBatchIds.includes(input.batchId)) {
        throw ApiError.forbidden("You can only register a student into a batch assigned to you.", 'NOT_YOUR_BATCH');
      }
    }
  }

  const studentCode = await nextStudentCode();

  // Registration, admission-fee creation, a 0-baseline performance record,
  // and (if this came from a walk-in) marking that lead as admitted, all
  // succeed or fail together — a transaction avoids ever ending up with a
  // registered student that's silently missing its fee record.
  const student = await prisma.$transaction(async (tx) => {
    const created = await tx.student.create({
      data: {
        studentCode,
        name: input.name,
        photo: input.photo,
        mobile: input.mobile,
        email: input.email,
        dob: input.dob,
        gender: GenderMap.toDb(input.gender),
        address: input.address,
        qualification: input.qualification,
        courseId: input.courseId,
        courseDuration: input.courseDuration,
        joiningDate: input.joiningDate,
        batchId: input.batchId,
        mode: StudentModeMap.toDb(input.mode),
        counsellorId,
        status: StudentStatusMap.toDb(input.status),
        walkInId: input.walkInId || null,
      },
      include: includeRelations,
    });

    const existingUser = await tx.user.findUnique({
      where: { email: created.email },
      include: { student: true, employee: true },
    });

    if (existingUser) {
      if (existingUser.student && existingUser.student.id !== created.id) {
        throw ApiError.conflict('An account with this email already exists for another student.', 'EMAIL_TAKEN');
      }
      if (existingUser.employee) {
        throw ApiError.conflict('An account with this email already exists for a staff member.', 'EMAIL_TAKEN');
      }

      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          name: created.name,
          phone: created.mobile,
          role: 'STUDENT',
          student: { connect: { id: created.id } },
        },
      });
    } else {
      await tx.user.create({
        data: {
          name: created.name,
          email: created.email,
          passwordHash: await hashPassword(created.email),
          role: 'STUDENT',
          phone: created.mobile,
          mustChangePassword: true,
          student: { connect: { id: created.id } },
        },
      });
    }

    await tx.fee.create({
      data: { studentId: created.id, courseFee: course.fee, discount: 0 },
    });

    await tx.performance.create({
      data: {
        studentId: created.id,
        date: created.joiningDate,
        technicalKnowledge: 0,
        practicalSkills: 0,
        communication: 0,
        attendance: 0,
        taskCompletion: 0,
        behaviour: 0,
        remarks: 'Baseline record — pending first evaluation.',
      },
    });

    if (input.walkInId) {
      await tx.walkIn.update({ where: { id: input.walkInId }, data: { status: 'ADMISSION' } });
    }

    return created;
  });

  return toPublic(student);
}

async function update(id, patch) {
  const data = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.photo !== undefined) data.photo = patch.photo;
  if (patch.mobile !== undefined) data.mobile = patch.mobile;
  if (patch.email !== undefined) data.email = patch.email;
  if (patch.dob !== undefined) data.dob = patch.dob;
  if (patch.gender !== undefined) data.gender = GenderMap.toDb(patch.gender);
  if (patch.address !== undefined) data.address = patch.address;
  if (patch.qualification !== undefined) data.qualification = patch.qualification;
  if (patch.courseId !== undefined) data.courseId = patch.courseId;
  if (patch.courseDuration !== undefined) data.courseDuration = patch.courseDuration;
  if (patch.joiningDate !== undefined) data.joiningDate = patch.joiningDate;
  if (patch.batchId !== undefined) data.batchId = patch.batchId;
  if (patch.mode !== undefined) data.mode = StudentModeMap.toDb(patch.mode);
  if (patch.counsellorId !== undefined) data.counsellorId = patch.counsellorId;
  if (patch.status !== undefined) data.status = StudentStatusMap.toDb(patch.status);

  const student = await prisma.student.update({ where: { id }, data, include: includeRelations });
  return toPublic(student);
}

async function remove(id) {
  // Fee, attendance, tasks, and performance records all cascade-delete at
  // the database level (see prisma/schema.prisma onDelete: Cascade) — no
  // manual cleanup needed here, and no risk of forgetting one.
  await prisma.student.delete({ where: { id } });
}

module.exports = { getAll, getAllRaw, getById, create, update, remove, toPublic };
