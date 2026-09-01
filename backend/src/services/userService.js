const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const { ActiveInactiveMap } = require('../utils/enumMaps');
const { parsePagination, buildPaginatedResult } = require('../utils/pagination');

function toPublic(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || '',
    phone: user.phone || '',
    status: ActiveInactiveMap.fromDb(user.status),
    employeeId: user.employee?.id ?? null,
    studentId: user.student?.id ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const includeLinks = { employee: true, student: true };

async function getAll(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = query.search
    ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take, include: includeLinks, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  return buildPaginatedResult(rows.map(toPublic), total, page, pageSize);
}

async function getById(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: includeLinks });
  if (!user) throw ApiError.notFound('User not found.');
  return toPublic(user);
}

async function create(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists.', 'EMAIL_TAKEN');

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      department: input.department,
      phone: input.phone,
      employee: input.employeeId ? { connect: { id: input.employeeId } } : undefined,
      student: input.studentId ? { connect: { id: input.studentId } } : undefined,
    },
    include: includeLinks,
  });
  return toPublic(user);
}

async function update(id, patch) {
  const data = { ...patch };
  if (data.status) data.status = ActiveInactiveMap.toDb(data.status);

  const user = await prisma.user.update({ where: { id }, data, include: includeLinks });
  return toPublic(user);
}

async function remove(id) {
  await prisma.user.delete({ where: { id } });
}

module.exports = { getAll, getById, create, update, remove };
