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

/**
 * A trainer's dashboard is scoped to only what they're responsible for —
 * their own batches/students and attendance — and deliberately excludes
 * revenue/fees, which STAFF has no permission to manage or view anywhere
 * else in the app either.
 */
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * A counsellor's job is leads/follow-ups, not batches — they'd see nothing
 * useful in the trainer-shaped dashboard below (no batches assigned to
 * them at all). Detected via Employee.type, since "Counsellor" is a job
 * type, not a separate auth Role — a counsellor still logs in as STAFF.
 */
async function getCounsellorStats(employeeId) {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const openStatuses = ['NEW', 'CONTACTED', 'COUNSELLING', 'INTERESTED'];

  const [totalLeads, newThisWeek, admissionsThisMonth, followUpsToday, overdueFollowUps] = await Promise.all([
    prisma.walkIn.count({ where: { counsellorId: employeeId } }),
    prisma.walkIn.count({ where: { counsellorId: employeeId, enquiryDate: { gte: weekAgo } } }),
    prisma.walkIn.count({ where: { counsellorId: employeeId, status: 'ADMISSION', updatedAt: { gte: monthAgo } } }),
    prisma.walkIn.findMany({
      where: {
        counsellorId: employeeId,
        status: { in: openStatuses },
        followUpDate: { gte: todayStart, lte: todayEnd },
      },
      include: { courseInterested: { select: { name: true } } },
      orderBy: { followUpDate: 'asc' },
    }),
    prisma.walkIn.findMany({
      where: {
        counsellorId: employeeId,
        status: { in: openStatuses },
        followUpDate: { lt: todayStart },
      },
      include: { courseInterested: { select: { name: true } } },
      orderBy: { followUpDate: 'asc' },
      take: 10,
    }),
  ]);

  const toFollowUpRow = (w) => ({
    id: w.id,
    name: w.name,
    mobile: w.mobile,
    course: w.courseInterested?.name ?? '',
    followUpDate: w.followUpDate,
    status: w.status,
  });

  return {
    dashboardType: 'counsellor',
    totalLeads,
    newThisWeek,
    admissionsThisMonth,
    followUpsDueToday: followUpsToday.length,
    followUpsOverdue: overdueFollowUps.length,
    todaysFollowUps: followUpsToday.map(toFollowUpRow),
    overdueList: overdueFollowUps.map(toFollowUpRow),
  };
}

async function getStaffStats(employeeId) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { type: true } });
  if (employee?.type === 'COUNSELLOR') {
    return getCounsellorStats(employeeId);
  }

  const { getStaffBatchIds, getStaffStudentIds } = require('../utils/staffScope');
  const batchIds = await getStaffBatchIds(employeeId);
  const studentIds = await getStaffStudentIds(employeeId);
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [
    myBatches,
    ongoingBatches,
    myStudents,
    activeStudents,
    attendanceRecords,
    pendingSubmissions,
    batchesMarkedToday,
    classReportsToday,
  ] = await Promise.all([
    batchIds.length,
    prisma.batch.count({ where: { id: { in: batchIds }, status: 'ONGOING' } }),
    studentIds.length,
    prisma.student.count({ where: { id: { in: studentIds }, status: 'ACTIVE' } }),
    studentIds.length ? prisma.attendance.findMany({ where: { studentId: { in: studentIds } } }) : Promise.resolve([]),
    prisma.taskSubmission.count({ where: { studentId: { in: studentIds }, status: { in: ['SUBMITTED', 'RESUBMITTED'] } } }),
    // Distinct batches that already have at least one attendance record marked today.
    batchIds.length
      ? prisma.attendance
          .findMany({
            where: { student: { batchId: { in: batchIds } }, date: { gte: todayStart, lte: todayEnd } },
            select: { student: { select: { batchId: true } } },
            distinct: ['studentId'],
          })
          .then((rows) => new Set(rows.map((r) => r.student.batchId)).size)
      : 0,
    prisma.classReport.count({ where: { batchId: { in: batchIds }, date: { gte: todayStart, lte: todayEnd } } }),
  ]);

  const attendanceSummary = attendanceService.summarize(
    attendanceRecords.map((r) => ({ status: { PRESENT: 'Present', ABSENT: 'Absent', LEAVE: 'Leave' }[r.status] })),
  );

  return {
    dashboardType: 'trainer',
    myBatches,
    ongoingBatches,
    myStudents,
    activeStudents,
    avgAttendance: attendanceSummary.percentage,
    pendingSubmissions,
    // "Today" — the ongoing batches that still need attention right now.
    batchesAttendancePending: Math.max(0, ongoingBatches - batchesMarkedToday),
    classReportsFiledToday: classReportsToday,
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

  const [attendanceRecords, classReports, submissions, fee] = await Promise.all([
    prisma.attendance.findMany({ where: { studentId } }),
    student.batchId
      ? prisma.classReport.findMany({ where: { batchId: student.batchId, date: { gte: student.joiningDate, lte: new Date() } } })
      : Promise.resolve([]),
    prisma.taskSubmission.findMany({ where: { studentId } }),
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
  // "Completed" for the dashboard's purposes = reviewed & approved, the
  // final state in the submission workflow.
  const completedTasks = submissions.filter((s) => s.status === 'REVIEWED').length;

  return {
    courseProgress: Math.min(100, Math.round((classesCompleted / totalPlanned) * 100)),
    attendancePercentage: attendanceSummary.percentage,
    classesCompleted,
    classesPending,
    feePaid: feeSummary.paidAmount,
    feePending: feeSummary.pendingAmount,
    tasksCompleted: completedTasks,
    tasksTotal: submissions.length,
  };
}

module.exports = { getStats, getStaffStats, getRevenueSeries, getCourseDistribution, getLeadFunnel, getStudentDashboardStats };
