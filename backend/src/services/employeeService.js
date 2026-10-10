const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const { roleForEmployeeType } = require('../constants/roles');
const { EmployeeTypeMap, ActiveInactiveMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

function toPublic(employee) {
  return {
    id: employee.id,
    employeeId: employee.employeeCode,
    name: employee.name,
    type: EmployeeTypeMap.fromDb(employee.type),
    email: employee.email,
    phone: employee.phone,
    status: ActiveInactiveMap.fromDb(employee.status),
    joiningDate: employee.joiningDate,
    assignedBatchIds: (employee.trainerBatches || []).map((b) => b.id),
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

async function nextEmployeeCode() {
  const count = await prisma.employee.count();
  return `EMP-2026-${(count + 1).toString().padStart(3, '0')}`;
}

async function getAll(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = {
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { employeeCode: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(query.type ? { type: EmployeeTypeMap.toDb(query.type) } : {}),
    ...(query.status ? { status: ActiveInactiveMap.toDb(query.status) } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.employee.findMany({ where, skip, take, include: { trainerBatches: true }, orderBy: { createdAt: 'desc' } }),
    prisma.employee.count({ where }),
  ]);

  return buildPaginatedResult(rows.map(toPublic), total, page, pageSize);
}

async function getAllRaw() {
  const rows = await prisma.employee.findMany({ include: { trainerBatches: true }, orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

async function getById(id) {
  const employee = await prisma.employee.findUnique({ where: { id }, include: { trainerBatches: true } });
  if (!employee) throw ApiError.notFound('Employee not found.');
  return toPublic(employee);
}

async function create(input) {
  const employeeCode = await nextEmployeeCode();
  const employee = await prisma.$transaction(async (tx) => {
    const created = await tx.employee.create({
      data: {
        employeeCode,
        name: input.name,
        type: EmployeeTypeMap.toDb(input.type),
        email: input.email,
        phone: input.phone,
        status: ActiveInactiveMap.toDb(input.status),
        joiningDate: input.joiningDate,
      },
      include: { trainerBatches: true },
    });

    // Only trainers and counsellors use the app. Developers, designers,
    // video editors and marketing staff are employee records only — no
    // login credentials are created for them.
    const loginRole = roleForEmployeeType(created.type);
    if (!loginRole) return created;

    const existingUser = await tx.user.findUnique({
      where: { email: created.email },
      include: { student: true, employee: true },
    });

    if (existingUser) {
      if (existingUser.employee && existingUser.employee.id !== created.id) {
        throw ApiError.conflict('An account with this email already exists for another staff member.', 'EMAIL_TAKEN');
      }
      if (existingUser.student) {
        throw ApiError.conflict('An account with this email already exists for a student.', 'EMAIL_TAKEN');
      }

      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          name: created.name,
          phone: created.phone,
          role: loginRole,
          employee: { connect: { id: created.id } },
        },
      });
    } else {
      await tx.user.create({
        data: {
          name: created.name,
          email: created.email,
          passwordHash: await hashPassword(created.email),
          role: loginRole,
          phone: created.phone,
          mustChangePassword: true,
          employee: { connect: { id: created.id } },
        },
      });
    }

    return created;
  });

  return toPublic(employee);
}

async function update(id, patch) {
  const data = { ...patch };
  if (data.type) data.type = EmployeeTypeMap.toDb(data.type);
  if (data.status) data.status = ActiveInactiveMap.toDb(data.status);

  const employee = await prisma.$transaction(async (tx) => {
    const updated = await tx.employee.update({ where: { id }, data, include: { trainerBatches: true } });

    // Keep the login in step with the job type: trainer → STAFF, counsellor
    // → COUNSELLOR. Moving to a type that doesn't use the app (developer,
    // designer, ...) deactivates the login instead of leaving stale access.
    if (patch.type) {
      const loginRole = roleForEmployeeType(updated.type);
      const linked = await tx.user.findFirst({ where: { employee: { id } } });

      if (linked && loginRole) {
        await tx.user.update({ where: { id: linked.id }, data: { role: loginRole, status: 'ACTIVE' } });
      } else if (linked && !loginRole) {
        await tx.user.update({ where: { id: linked.id }, data: { status: 'INACTIVE' } });
        await tx.refreshToken.updateMany({ where: { userId: linked.id, revokedAt: null }, data: { revokedAt: new Date() } });
      } else if (!linked && loginRole) {
        const emailTaken = await tx.user.findUnique({ where: { email: updated.email } });
        if (!emailTaken) {
          await tx.user.create({
            data: {
              name: updated.name,
              email: updated.email,
              passwordHash: await hashPassword(updated.email),
              role: loginRole,
              phone: updated.phone,
              mustChangePassword: true,
              employee: { connect: { id: updated.id } },
            },
          });
        }
      }
    }
    return updated;
  });
  return toPublic(employee);
}

async function remove(id) {
  await prisma.employee.delete({ where: { id } });
}

module.exports = { getAll, getAllRaw, getById, create, update, remove, toPublic };
