const prisma = require('../config/prisma');

async function globalSearch(query) {
  const q = (query || '').trim();
  if (!q) return { students: [], walkIns: [], batches: [], employees: [] };

  const insensitive = { contains: q, mode: 'insensitive' };

  const [students, walkIns, batches, employees] = await Promise.all([
    prisma.student.findMany({
      where: { OR: [{ name: insensitive }, { studentCode: insensitive }, { email: insensitive }, { mobile: insensitive }] },
      include: { course: true },
      take: 5,
    }),
    prisma.walkIn.findMany({
      where: { OR: [{ name: insensitive }, { mobile: insensitive }, { email: insensitive }] },
      take: 5,
    }),
    prisma.batch.findMany({
      where: { OR: [{ name: insensitive }, { batchCode: insensitive }] },
      take: 5,
    }),
    prisma.employee.findMany({
      where: { OR: [{ name: insensitive }, { employeeCode: insensitive }, { email: insensitive }] },
      take: 5,
    }),
  ]);

  return {
    students: students.map((s) => ({ id: s.id, title: s.name, subtitle: `${s.studentCode} · ${s.course?.name || ''}` })),
    walkIns: walkIns.map((w) => ({ id: w.id, title: w.name, subtitle: `${w.status}` })),
    batches: batches.map((b) => ({ id: b.id, title: b.name, subtitle: `${b.batchCode} · ${b.status}` })),
    employees: employees.map((e) => ({ id: e.id, title: e.name, subtitle: `${e.type} · ${e.employeeCode}` })),
  };
}

module.exports = { globalSearch };
