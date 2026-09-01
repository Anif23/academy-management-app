const prisma = require('../config/prisma');
const feeService = require('./feeService');
const attendanceService = require('./attendanceService');

async function getStats() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    totalStudents,
    activeStudents,
    totalWalkIns,
    newLeadsThisWeek,
    totalBatches,
    ongoingBatches,
    totalEmployees,
    totalTrainers,
    admissionsThisMonth,
    fees,
    attendanceRecords,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.walkIn.count(),
    prisma.walkIn.count({ where: { enquiryDate: { gte: weekAgo } } }),
    prisma.batch.count(),
    prisma.batch.count({ where: { status: 'ONGOING' } }),
    prisma.employee.count(),
    prisma.employee.count({ where: { type: 'TRAINER' } }),
    prisma.student.count({ where: { joiningDate: { gte: monthAgo } } }),
    prisma.fee.findMany({ include: { payments: true } }),
    prisma.attendance.findMany(),
  ]);

  const totalRevenue = fees.reduce((sum, f) => sum + feeService.summarize(f).paidAmount, 0);
  const pendingFees = fees.reduce((sum, f) => sum + feeService.summarize(f).pendingAmount, 0);
  const attendanceSummary = attendanceService.summarize(
    attendanceRecords.map((r) => ({ status: { PRESENT: 'Present', ABSENT: 'Absent', LEAVE: 'Leave' }[r.status] })),
  );

  return {
    totalStudents,
    activeStudents,
    totalWalkIns,
    newLeadsThisWeek,
    totalBatches,
    ongoingBatches,
    totalEmployees,
    totalTrainers,
    totalRevenue,
    pendingFees,
    avgAttendance: attendanceSummary.percentage,
    admissionsThisMonth,
  };
}

async function getRevenueSeries() {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('en-US', { month: 'short' }) };
  });

  const payments = await prisma.payment.findMany();

  return months.map(({ year, month, label }, i) => {
    const revenue = payments
      .filter((p) => p.date.getFullYear() === year && p.date.getMonth() === month)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return { month: label, revenue, target: 200000 + i * 15000 };
  });
}

async function getCourseDistribution() {
  const students = await prisma.student.findMany({ include: { course: true } });
  const map = new Map();
  students.forEach((s) => {
    const name = s.course?.name || 'Unknown';
    map.set(name, (map.get(name) || 0) + 1);
  });
  return Array.from(map.entries()).map(([course, count]) => ({ course, count }));
}

async function getLeadFunnel() {
  const stages = ['NEW', 'CONTACTED', 'COUNSELLING', 'INTERESTED', 'ADMISSION'];
  const labels = { NEW: 'New', CONTACTED: 'Contacted', COUNSELLING: 'Counselling', INTERESTED: 'Interested', ADMISSION: 'Admission' };
  const counts = await Promise.all(stages.map((s) => prisma.walkIn.count({ where: { status: s } })));
  return stages.map((s, i) => ({ stage: labels[s], count: counts[i] }));
}

async function getStudentDashboardStats(studentId) {
  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { batch: true } });
  if (!student) return null;

  const [attendanceRecords, classReports, tasks, fee] = await Promise.all([
    prisma.attendance.findMany({ where: { studentId } }),
    student.batchId
      ? prisma.classReport.findMany({ where: { batchId: student.batchId, date: { gte: student.joiningDate, lte: new Date() } } })
      : Promise.resolve([]),
    prisma.task.findMany({ where: { studentId } }),
    prisma.fee.findUnique({ where: { studentId }, include: { payments: true } }),
  ]);

  const attendanceSummary = attendanceService.summarize(
    attendanceRecords.map((r) => ({ status: { PRESENT: 'Present', ABSENT: 'Absent', LEAVE: 'Leave' }[r.status] })),
  );

  const classesCompleted = classReports.length;
  let classesPending = 0;
  if (student.batch) {
    const now = new Date();
    if (student.batch.endDate > now) {
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksRemaining = (student.batch.endDate.getTime() - now.getTime()) / msPerWeek;
      const sessionsPerWeek = student.batch.days.length || 3;
      classesPending = Math.max(0, Math.round(weeksRemaining * sessionsPerWeek));
    }
  }

  const totalPlanned = classesCompleted + classesPending || 1;
  const feeSummary = fee ? feeService.summarize(fee) : { paidAmount: 0, pendingAmount: 0 };
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  return {
    courseProgress: Math.min(100, Math.round((classesCompleted / totalPlanned) * 100)),
    attendancePercentage: attendanceSummary.percentage,
    classesCompleted,
    classesPending,
    feePaid: feeSummary.paidAmount,
    feePending: feeSummary.pendingAmount,
    tasksCompleted: completedTasks,
    tasksTotal: tasks.length,
  };
}

module.exports = { getStats, getRevenueSeries, getCourseDistribution, getLeadFunnel, getStudentDashboardStats };
