import { createCrudService, delay, generateId, nowIso } from './crudFactory';
import {
  collections,
  saveAttendance,
  saveBatches,
  saveClassReports,
  saveCourses,
  saveEmployees,
  saveFees,
  savePerformance,
  saveStudents,
  saveTasks,
  saveWalkIns,
} from './storage';
import type {
  AttendanceRecord,
  AttendanceSummary,
  Batch,
  ClassReport,
  CourseRecord,
  DashboardStats,
  Employee,
  FeeRecord,
  FeeSummary,
  GlobalSearchResults,
  PaymentEntry,
  PerformanceRecord,
  Student,
  StudentDashboardStats,
  StudentTask,
  WalkIn,
} from '../types';

// --------------------------------------------------------------------------
// Shared helpers
// --------------------------------------------------------------------------

// Removes a student and safely cleans up every dependent record so nothing
// is left orphaned. Used both by direct student deletion and by reverting a
// walk-in's status away from "Admission" after it had already been converted.
function removeStudentCascade(studentId: string): void {
  saveStudents(collections.students().filter((s) => s.id !== studentId));
  saveBatches(collections.batches().map((b) => ({ ...b, studentIds: b.studentIds.filter((sid) => sid !== studentId) })));
  saveFees(collections.fees().filter((f) => f.studentId !== studentId));
  saveAttendance(collections.attendance().filter((a) => a.studentId !== studentId));
  saveTasks(collections.tasks().filter((t) => t.studentId !== studentId));
  savePerformance(collections.performance().filter((p) => p.studentId !== studentId));
}

// --------------------------------------------------------------------------
// Employees
// --------------------------------------------------------------------------

const employeeCrud = createCrudService<Employee>({
  load: collections.employees,
  save: saveEmployees,
  searchableFields: (e) => [e.name, e.employeeId, e.email, e.phone, e.type],
});

export const employeesApi = {
  ...employeeCrud,
  async createEmployee(input: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt' | 'assignedBatchIds'>) {
    const all = collections.employees();
    const employee: Employee = {
      ...input,
      id: generateId('EMP'),
      employeeId: `EMP-2026-${(all.length + 1).toString().padStart(3, '0')}`,
      assignedBatchIds: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return employeeCrud.create(employee);
  },
};

// --------------------------------------------------------------------------
// Batches
// --------------------------------------------------------------------------

const batchCrud = createCrudService<Batch>({
  load: collections.batches,
  save: saveBatches,
  searchableFields: (b) => [b.name, b.batchId, b.course],
});

export const batchesApi = {
  ...batchCrud,
  async createBatch(input: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'studentIds'>) {
    const batch: Batch = {
      ...input,
      id: generateId('BATCH'),
      studentIds: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return batchCrud.create(batch);
  },
  async remove(id: string) {
    const students = collections.students();
    if (students.some((s) => s.batchId === id)) {
      throw new Error('Cannot delete a batch that has students assigned to it.');
    }
    return batchCrud.remove(id);
  },
};

// --------------------------------------------------------------------------
// Walk-ins
// --------------------------------------------------------------------------

const walkInCrud = createCrudService<WalkIn>({
  load: collections.walkIns,
  save: saveWalkIns,
  searchableFields: (w) => [w.name, w.mobile, w.email, w.courseInterested, w.location],
});

export const walkInsApi = {
  ...walkInCrud,
  async createWalkIn(input: Omit<WalkIn, 'id' | 'createdAt' | 'updatedAt'>) {
    const walkIn: WalkIn = {
      ...input,
      id: generateId('WI'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return walkInCrud.create(walkIn);
  },
  async update(id: string, patch: Partial<WalkIn>) {
    const existing = collections.walkIns().find((w) => w.id === id);

    // If this walk-in had already been admitted (converted to a student) and
    // its status is now being changed away from "Admission", treat that as
    // voiding the admission: remove the student and every dependent record
    // everywhere in the app, and drop the link back to this walk-in.
    if (existing?.convertedStudentId && patch.status && patch.status !== 'Admission') {
      removeStudentCascade(existing.convertedStudentId);
      patch = { ...patch, convertedStudentId: '' };
    }

    return walkInCrud.update(id, { ...patch, updatedAt: nowIso() });
  },
};

// --------------------------------------------------------------------------
// Students
// --------------------------------------------------------------------------

const studentCrud = createCrudService<Student>({
  load: collections.students,
  save: saveStudents,
  searchableFields: (s) => [s.name, s.studentId, s.email, s.mobile, s.course],
});

export const studentsApi = {
  ...studentCrud,
  async createStudent(input: Omit<Student, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>) {
    const all = collections.students();
    const student: Student = {
      ...input,
      id: generateId('STU'),
      studentId: `STU-2026-${(all.length + 1).toString().padStart(5, '0')}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await studentCrud.create(student);

    const batches = collections.batches();
    const batchIndex = batches.findIndex((b) => b.id === student.batchId);
    if (batchIndex !== -1) {
      batches[batchIndex] = { ...batches[batchIndex], studentIds: [...batches[batchIndex].studentIds, student.id] };
      saveBatches(batches);
    }

    if (input.walkInId) {
      const walkIns = collections.walkIns();
      const idx = walkIns.findIndex((w) => w.id === input.walkInId);
      if (idx !== -1) {
        walkIns[idx] = { ...walkIns[idx], status: 'Admission', convertedStudentId: student.id, updatedAt: nowIso() };
        saveWalkIns(walkIns);
      }
    }

    const existingFee = collections.fees().find((f) => f.studentId === student.id);
    if (!existingFee) {
      const course = collections.courses().find((c) => c.name === student.course);
      const fee: FeeRecord = {
        id: generateId('FEE'),
        studentId: student.id,
        courseFee: course?.fee ?? 0,
        discount: 0,
        paymentDate: '',
        paymentMode: 'Cash',
        nextPaymentDate: '',
        remarks: '',
        payments: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      saveFees([fee, ...collections.fees()]);
    }

    // A student should appear on the Performance page from day one, starting
    // at a 0 baseline, rather than being invisible until their first formal
    // evaluation is entered.
    const existingPerformance = collections.performance().find((p) => p.studentId === student.id);
    if (!existingPerformance) {
      const baseline: PerformanceRecord = {
        id: generateId('PERF'),
        studentId: student.id,
        date: student.joiningDate || nowIso().slice(0, 10),
        technicalKnowledge: 0,
        practicalSkills: 0,
        communication: 0,
        attendance: 0,
        taskCompletion: 0,
        behaviour: 0,
        remarks: 'Baseline record — pending first evaluation.',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      savePerformance([baseline, ...collections.performance()]);
    }

    return student;
  },
  async update(id: string, patch: Partial<Student>) {
    const existing = collections.students().find((s) => s.id === id);
    const updated = await studentCrud.update(id, { ...patch, updatedAt: nowIso() });

    if (patch.batchId && existing && existing.batchId !== patch.batchId) {
      const batches = collections.batches();
      const nextBatches = batches.map((b) => {
        if (b.id === existing.batchId) return { ...b, studentIds: b.studentIds.filter((sid) => sid !== id) };
        if (b.id === patch.batchId) return { ...b, studentIds: [...new Set([...b.studentIds, id])] };
        return b;
      });
      saveBatches(nextBatches);
    }

    return updated;
  },
  async remove(id: string) {
    await studentCrud.remove(id);
    const batches = collections.batches();
    saveBatches(batches.map((b) => ({ ...b, studentIds: b.studentIds.filter((sid) => sid !== id) })));
    saveFees(collections.fees().filter((f) => f.studentId !== id));
    saveAttendance(collections.attendance().filter((a) => a.studentId !== id));
    saveTasks(collections.tasks().filter((t) => t.studentId !== id));
    savePerformance(collections.performance().filter((p) => p.studentId !== id));
  },
};

// --------------------------------------------------------------------------
// Fees
// --------------------------------------------------------------------------

const feeCrud = createCrudService<FeeRecord>({
  load: collections.fees,
  save: saveFees,
  searchableFields: () => [],
});

export function computeFeeSummary(fee: FeeRecord): FeeSummary {
  const finalFee = fee.courseFee - fee.discount;
  const paidAmount = fee.payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    courseFee: fee.courseFee,
    discount: fee.discount,
    finalFee,
    paidAmount,
    pendingAmount: Math.max(0, finalFee - paidAmount),
  };
}

export const feesApi = {
  ...feeCrud,
  async getByStudent(studentId: string) {
    await delay(150);
    return collections.fees().find((f) => f.studentId === studentId) ?? null;
  },
  async update(id: string, patch: Partial<FeeRecord>) {
    return feeCrud.update(id, { ...patch, updatedAt: nowIso() });
  },
  async addPayment(feeId: string, payment: Omit<PaymentEntry, 'id'>) {
    await delay();
    const fees = collections.fees();
    const index = fees.findIndex((f) => f.id === feeId);
    if (index === -1) throw new Error('Fee record not found');
    const entry: PaymentEntry = { ...payment, id: generateId('PMT') };
    const updated: FeeRecord = {
      ...fees[index],
      payments: [...fees[index].payments, entry],
      paymentDate: entry.date,
      paymentMode: entry.mode,
      updatedAt: nowIso(),
    };
    fees[index] = updated;
    saveFees(fees);
    return updated;
  },
};

// --------------------------------------------------------------------------
// Attendance
// --------------------------------------------------------------------------

const attendanceCrud = createCrudService<AttendanceRecord>({
  load: collections.attendance,
  save: saveAttendance,
  searchableFields: () => [],
});

export function computeAttendanceSummary(records: AttendanceRecord[]): AttendanceSummary {
  const total = records.length;
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const leave = records.filter((r) => r.status === 'Leave').length;
  return {
    total,
    present,
    absent,
    leave,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };
}

export const attendanceApi = {
  ...attendanceCrud,
  async getByStudent(studentId: string) {
    await delay(150);
    return collections.attendance().filter((a) => a.studentId === studentId);
  },
  async getByBatchAndDate(batchId: string, date: string) {
    await delay(150);
    return collections.attendance().filter((a) => a.batchId === batchId && a.date === date);
  },
  async markBulk(batchId: string, date: string, marks: Array<{ studentId: string; status: AttendanceRecord['status'] }>) {
    await delay();
    const all = collections.attendance();
    const filtered = all.filter((a) => !(a.batchId === batchId && a.date === date));
    const created = marks.map((m) => ({
      id: generateId('ATT'),
      studentId: m.studentId,
      batchId,
      date,
      status: m.status,
      createdAt: nowIso(),
    }));
    saveAttendance([...created, ...filtered]);
    return created;
  },
};

// --------------------------------------------------------------------------
// Class reports
// --------------------------------------------------------------------------

export interface ClassAttendanceSummary {
  present: number;
  total: number;
  marked: boolean;
}

export function computeClassAttendance(batchId: string, date: string): ClassAttendanceSummary {
  const records = collections.attendance().filter((a) => a.batchId === batchId && a.date === date);
  const eligibleStudents = collections.students().filter((s) => s.batchId === batchId && s.joiningDate && s.joiningDate <= date);
  return {
    present: records.filter((r) => r.status === 'Present').length,
    total: eligibleStudents.length,
    marked: records.length > 0,
  };
}

const classReportCrud = createCrudService<ClassReport>({
  load: collections.classReports,
  save: saveClassReports,
  searchableFields: (r) => [r.topic, r.module, r.description],
});

export const classReportsApi = {
  ...classReportCrud,
  async createReport(input: Omit<ClassReport, 'id' | 'createdAt' | 'updatedAt'>) {
    const report: ClassReport = { ...input, id: generateId('CR'), createdAt: nowIso(), updatedAt: nowIso() };
    return classReportCrud.create(report);
  },
  async update(id: string, patch: Partial<ClassReport>) {
    return classReportCrud.update(id, { ...patch, updatedAt: nowIso() });
  },
};

// --------------------------------------------------------------------------
// Courses
// --------------------------------------------------------------------------

const courseCrud = createCrudService<CourseRecord>({
  load: collections.courses,
  save: saveCourses,
  searchableFields: (c) => [c.name, c.description],
});

export const coursesApi = {
  ...courseCrud,
  async createCourse(input: Omit<CourseRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const course: CourseRecord = { ...input, id: generateId('CRS'), createdAt: nowIso(), updatedAt: nowIso() };
    return courseCrud.create(course);
  },
  async update(id: string, patch: Partial<CourseRecord>) {
    const existing = collections.courses().find((c) => c.id === id);
    const updated = await courseCrud.update(id, { ...patch, updatedAt: nowIso() });

    // Renaming a course keeps every student/batch/walk-in record pointing at
    // the same course by updating their stored course name in lock-step.
    if (existing && patch.name && patch.name !== existing.name) {
      saveStudents(collections.students().map((s) => (s.course === existing.name ? { ...s, course: patch.name as string } : s)));
      saveBatches(collections.batches().map((b) => (b.course === existing.name ? { ...b, course: patch.name as string } : b)));
      saveWalkIns(
        collections.walkIns().map((w) => (w.courseInterested === existing.name ? { ...w, courseInterested: patch.name as string } : w)),
      );
    }

    return updated;
  },
  async remove(id: string) {
    const course = collections.courses().find((c) => c.id === id);
    if (course) {
      const inUse =
        collections.students().some((s) => s.course === course.name) || collections.batches().some((b) => b.course === course.name);
      if (inUse) {
        throw new Error('Cannot delete a course that has students or batches assigned to it. Mark it Inactive instead.');
      }
    }
    return courseCrud.remove(id);
  },
};

// --------------------------------------------------------------------------
// Tasks
// --------------------------------------------------------------------------

const taskCrud = createCrudService<StudentTask>({
  load: collections.tasks,
  save: saveTasks,
  searchableFields: (t) => [t.title, t.description],
});

export const tasksApi = {
  ...taskCrud,
  async getByStudent(studentId: string) {
    await delay(150);
    return collections.tasks().filter((t) => t.studentId === studentId);
  },
  async createTask(input: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) {
    const task: StudentTask = { ...input, id: generateId('TSK'), createdAt: nowIso(), updatedAt: nowIso() };
    return taskCrud.create(task);
  },
  async createBatchTask(
    input: Omit<StudentTask, 'id' | 'studentId' | 'createdAt' | 'updatedAt' | 'batchAssignmentId'> & { batchId: string },
  ) {
    await delay();
    const students = collections.students().filter((s) => s.batchId === input.batchId && s.status === 'Active');
    if (students.length === 0) {
      throw new Error('This batch has no active students to assign the task to.');
    }
    const batchAssignmentId = generateId('TSKB');
    const now = nowIso();
    const newTasks: StudentTask[] = students.map((student) => ({
      ...input,
      id: generateId('TSK'),
      studentId: student.id,
      batchAssignmentId,
      createdAt: now,
      updatedAt: now,
    }));
    saveTasks([...newTasks, ...collections.tasks()]);
    return newTasks;
  },
  async update(id: string, patch: Partial<StudentTask>) {
    return taskCrud.update(id, { ...patch, updatedAt: nowIso() });
  },
};

// --------------------------------------------------------------------------
// Performance
// --------------------------------------------------------------------------

const performanceCrud = createCrudService<PerformanceRecord>({
  load: collections.performance,
  save: savePerformance,
  searchableFields: () => [],
});

export function computeOverallPerformance(record: PerformanceRecord): number {
  const { technicalKnowledge, practicalSkills, communication, attendance, taskCompletion, behaviour } = record;
  const avg = (technicalKnowledge + practicalSkills + communication + attendance + taskCompletion + behaviour) / 6;
  return Math.round(avg * 10) / 10;
}

export const performanceApi = {
  ...performanceCrud,
  async getByStudent(studentId: string) {
    await delay(150);
    return collections.performance().filter((p) => p.studentId === studentId);
  },
  async createRecord(input: Omit<PerformanceRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const record: PerformanceRecord = { ...input, id: generateId('PERF'), createdAt: nowIso(), updatedAt: nowIso() };
    return performanceCrud.create(record);
  },
  async update(id: string, patch: Partial<PerformanceRecord>) {
    return performanceCrud.update(id, { ...patch, updatedAt: nowIso() });
  },
};

// --------------------------------------------------------------------------
// Student 360 dashboard
// --------------------------------------------------------------------------

export async function getStudentDashboardStats(studentId: string): Promise<StudentDashboardStats> {
  await delay(200);
  const attendance = collections.attendance().filter((a) => a.studentId === studentId);
  const summary = computeAttendanceSummary(attendance);
  const reports = collections.classReports();
  const student = collections.students().find((s) => s.id === studentId);
  const batch = student ? collections.batches().find((b) => b.id === student.batchId) : undefined;
  const todayStr = new Date().toISOString().slice(0, 10);

  // A student can only have "completed" classes that were held on or after
  // the day they actually joined — earlier sessions for that batch happened
  // before they were enrolled and should not count toward their progress.
  const relevantReports = student
    ? reports.filter((r) => r.batchId === student.batchId && r.date >= student.joiningDate && r.date <= todayStr)
    : [];
  const classesCompleted = relevantReports.length;

  let classesPending = 0;
  if (batch) {
    const today = new Date();
    const end = new Date(batch.endDate);
    if (end.getTime() > today.getTime()) {
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksRemaining = (end.getTime() - today.getTime()) / msPerWeek;
      const sessionsPerWeek = batch.days.length || 3;
      classesPending = Math.max(0, Math.round(weeksRemaining * sessionsPerWeek));
    }
  }

  const tasks = collections.tasks().filter((t) => t.studentId === studentId);
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const fee = collections.fees().find((f) => f.studentId === studentId);
  const feeSummary = fee ? computeFeeSummary(fee) : { finalFee: 0, paidAmount: 0, pendingAmount: 0, courseFee: 0, discount: 0 };

  const totalPlanned = classesCompleted + classesPending || 1;
  const courseProgress = Math.min(100, Math.round((classesCompleted / totalPlanned) * 100));

  return {
    courseProgress,
    attendancePercentage: summary.percentage,
    classesCompleted,
    classesPending,
    feePaid: feeSummary.paidAmount,
    feePending: feeSummary.pendingAmount,
    tasksCompleted: completedTasks,
    tasksTotal: tasks.length,
  };
}

// --------------------------------------------------------------------------
// Main admin dashboard
// --------------------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(300);
  const students = collections.students();
  const walkIns = collections.walkIns();
  const batches = collections.batches();
  const employees = collections.employees();
  const fees = collections.fees();
  const attendance = collections.attendance();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const totalRevenue = fees.reduce((sum, f) => sum + computeFeeSummary(f).paidAmount, 0);
  const pendingFees = fees.reduce((sum, f) => sum + computeFeeSummary(f).pendingAmount, 0);
  const summary = computeAttendanceSummary(attendance);

  return {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'Active').length,
    totalWalkIns: walkIns.length,
    newLeadsThisWeek: walkIns.filter((w) => new Date(w.enquiryDate) >= weekAgo).length,
    totalBatches: batches.length,
    ongoingBatches: batches.filter((b) => b.status === 'Ongoing').length,
    totalEmployees: employees.length,
    totalTrainers: employees.filter((e) => e.type === 'Trainer').length,
    totalRevenue,
    pendingFees,
    avgAttendance: summary.percentage,
    admissionsThisMonth: students.filter((s) => new Date(s.joiningDate) >= monthAgo).length,
  };
}

export async function getRevenueSeries(): Promise<Array<{ month: string; revenue: number; target: number }>> {
  await delay(250);
  const fees = collections.fees();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) };
  });

  return months.map(({ key, label }, i) => {
    const revenue = fees.reduce((sum, f) => {
      return (
        sum +
        f.payments
          .filter((p) => {
            const d = new Date(p.date);
            return `${d.getFullYear()}-${d.getMonth()}` === key;
          })
          .reduce((s, p) => s + p.amount, 0)
      );
    }, 0);
    return { month: label, revenue, target: 200000 + i * 15000 };
  });
}

export async function getCourseDistribution(): Promise<Array<{ course: string; count: number }>> {
  await delay(200);
  const students = collections.students();
  const map = new Map<string, number>();
  students.forEach((s) => map.set(s.course, (map.get(s.course) ?? 0) + 1));
  return Array.from(map.entries()).map(([course, count]) => ({ course, count }));
}

export async function getLeadFunnel(): Promise<Array<{ stage: string; count: number }>> {
  await delay(200);
  const walkIns = collections.walkIns();
  const stages: Array<WalkIn['status']> = ['New', 'Contacted', 'Counselling', 'Interested', 'Admission'];
  return stages.map((stage) => ({ stage, count: walkIns.filter((w) => w.status === stage).length }));
}

// --------------------------------------------------------------------------
// Global search
// --------------------------------------------------------------------------

export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  await delay(200);
  const q = query.trim().toLowerCase();
  if (!q) {
    return { students: [], walkIns: [], batches: [], employees: [] };
  }

  const students = collections
    .students()
    .filter((s) => [s.name, s.studentId, s.email, s.mobile].some((f) => f.toLowerCase().includes(q)))
    .slice(0, 5)
    .map((s) => ({ id: s.id, title: s.name, subtitle: `${s.studentId} · ${s.course}` }));

  const walkIns = collections
    .walkIns()
    .filter((w) => [w.name, w.mobile, w.email].some((f) => f.toLowerCase().includes(q)))
    .slice(0, 5)
    .map((w) => ({ id: w.id, title: w.name, subtitle: `${w.courseInterested} · ${w.status}` }));

  const batches = collections
    .batches()
    .filter((b) => [b.name, b.batchId, b.course].some((f) => f.toLowerCase().includes(q)))
    .slice(0, 5)
    .map((b) => ({ id: b.id, title: b.name, subtitle: `${b.batchId} · ${b.status}` }));

  const employees = collections
    .employees()
    .filter((e) => [e.name, e.employeeId, e.email].some((f) => f.toLowerCase().includes(q)))
    .slice(0, 5)
    .map((e) => ({ id: e.id, title: e.name, subtitle: `${e.type} · ${e.employeeId}` }));

  return { students, walkIns, batches, employees };
}
