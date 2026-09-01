import { createHttpCrudService } from './crudFactory';
import { httpClient, toErrorMessage } from './httpClient';
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

async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
}

// --------------------------------------------------------------------------
// Employees
// --------------------------------------------------------------------------

const employeeCrud = createHttpCrudService<Employee>('/employees');

export const employeesApi = {
  ...employeeCrud,
  async createEmployee(input: Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'updatedAt' | 'assignedBatchIds'>) {
    return employeeCrud.create(input);
  },
};

// --------------------------------------------------------------------------
// Batches
// --------------------------------------------------------------------------

const batchCrud = createHttpCrudService<Batch>('/batches');

export const batchesApi = {
  ...batchCrud,
  async createBatch(input: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'studentIds' | 'course'>) {
    return batchCrud.create(input);
  },
};

// --------------------------------------------------------------------------
// Walk-ins
// --------------------------------------------------------------------------

const walkInCrud = createHttpCrudService<WalkIn>('/walkins');

export const walkInsApi = {
  ...walkInCrud,
  async createWalkIn(input: Omit<WalkIn, 'id' | 'createdAt' | 'updatedAt' | 'courseInterested'>) {
    return walkInCrud.create(input);
  },
};

// --------------------------------------------------------------------------
// Students
// --------------------------------------------------------------------------

const studentCrud = createHttpCrudService<Student>('/students');

export const studentsApi = {
  ...studentCrud,
  async createStudent(input: Omit<Student, 'id' | 'studentId' | 'createdAt' | 'updatedAt' | 'course'>) {
    return studentCrud.create(input);
  },
  async getMe() {
    return unwrap<Student>(httpClient.get('/students/me'));
  },
};

// --------------------------------------------------------------------------
// Fees
// --------------------------------------------------------------------------

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
  async getAll(_params?: unknown) {
    return unwrap<FeeRecord[]>(httpClient.get('/fees/all')).then((data) => ({
      data,
      total: data.length,
      page: 1,
      pageSize: data.length || 1,
      totalPages: 1,
    }));
  },
  async getAllRaw() {
    return unwrap<FeeRecord[]>(httpClient.get('/fees/all'));
  },
  async getByStudent(studentId: string) {
    return unwrap<FeeRecord | null>(httpClient.get(`/fees/student/${studentId}`));
  },
  async update(id: string, patch: Partial<FeeRecord>) {
    return unwrap<FeeRecord>(httpClient.patch(`/fees/${id}`, patch));
  },
  async addPayment(feeId: string, payment: Omit<PaymentEntry, 'id'>) {
    return unwrap<FeeRecord>(httpClient.post(`/fees/${feeId}/payments`, payment));
  },
  async getMine() {
    return unwrap<FeeRecord | null>(httpClient.get('/fees/me'));
  },
};

// --------------------------------------------------------------------------
// Attendance
// --------------------------------------------------------------------------

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
  async getAllRaw() {
    return unwrap<AttendanceRecord[]>(httpClient.get('/attendance/all'));
  },
  async getByStudent(studentId: string) {
    return unwrap<AttendanceRecord[]>(httpClient.get(`/attendance/student/${studentId}`));
  },
  async getByBatchAndDate(batchId: string, date: string) {
    return unwrap<AttendanceRecord[]>(httpClient.get('/attendance/by-batch-date', { params: { batchId, date } }));
  },
  async markBulk(batchId: string, date: string, marks: Array<{ studentId: string; status: AttendanceRecord['status'] }>) {
    return unwrap<AttendanceRecord[]>(httpClient.post('/attendance/mark', { batchId, date, marks }));
  },
  async getMine() {
    return unwrap<AttendanceRecord[]>(httpClient.get('/attendance/me'));
  },
};

// --------------------------------------------------------------------------
// Class report ↔ attendance linkage
// --------------------------------------------------------------------------

export interface ClassAttendanceSummary {
  present: number;
  total: number;
  marked: boolean;
}

/** Live preview used while filling out the Class Report form. */
export async function fetchClassAttendancePreview(batchId: string, date: string): Promise<ClassAttendanceSummary> {
  if (!batchId || !date) return { present: 0, total: 0, marked: false };
  return unwrap<ClassAttendanceSummary>(httpClient.get('/attendance/class-summary', { params: { batchId, date } }));
}

// --------------------------------------------------------------------------
// Class reports
// --------------------------------------------------------------------------

const classReportCrud = createHttpCrudService<ClassReport & { attendance: ClassAttendanceSummary }>('/class-reports');

export const classReportsApi = {
  ...classReportCrud,
  async createReport(input: Omit<ClassReport, 'id' | 'createdAt' | 'updatedAt'>) {
    return classReportCrud.create(input);
  },
};

// --------------------------------------------------------------------------
// Courses
// --------------------------------------------------------------------------

const courseCrud = createHttpCrudService<CourseRecord>('/courses');

export const coursesApi = {
  ...courseCrud,
  async createCourse(input: Omit<CourseRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    return courseCrud.create(input);
  },
};

// --------------------------------------------------------------------------
// Tasks
// --------------------------------------------------------------------------

const taskCrud = createHttpCrudService<StudentTask>('/tasks');

export const tasksApi = {
  ...taskCrud,
  async getByStudent(studentId: string) {
    return unwrap<StudentTask[]>(httpClient.get(`/tasks/student/${studentId}`));
  },
  async createTask(input: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) {
    return taskCrud.create(input);
  },
  async createBatchTask(
    input: Omit<StudentTask, 'id' | 'studentId' | 'createdAt' | 'updatedAt' | 'batchAssignmentId'> & { batchId: string },
  ) {
    return unwrap<StudentTask[]>(httpClient.post('/tasks/batch', input));
  },
  async getMine() {
    return unwrap<StudentTask[]>(httpClient.get('/tasks/me'));
  },
};

// --------------------------------------------------------------------------
// Performance
// --------------------------------------------------------------------------

export function computeOverallPerformance(record: PerformanceRecord): number {
  const { technicalKnowledge, practicalSkills, communication, attendance, taskCompletion, behaviour } = record;
  const avg = (technicalKnowledge + practicalSkills + communication + attendance + taskCompletion + behaviour) / 6;
  return Math.round(avg * 10) / 10;
}

const performanceCrud = createHttpCrudService<PerformanceRecord>('/performance');

export const performanceApi = {
  ...performanceCrud,
  async getByStudent(studentId: string) {
    return unwrap<PerformanceRecord[]>(httpClient.get(`/performance/student/${studentId}`));
  },
  async createRecord(input: Omit<PerformanceRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    return performanceCrud.create(input);
  },
  async getMine() {
    return unwrap<PerformanceRecord[]>(httpClient.get('/performance/me'));
  },
};

// --------------------------------------------------------------------------
// Dashboards
// --------------------------------------------------------------------------

export async function getStudentDashboardStats(studentId: string): Promise<StudentDashboardStats> {
  return unwrap<StudentDashboardStats>(httpClient.get(`/dashboard/student/${studentId}`));
}

export async function getMyDashboardStats(): Promise<StudentDashboardStats> {
  return unwrap<StudentDashboardStats>(httpClient.get('/dashboard/student/me'));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return unwrap<DashboardStats>(httpClient.get('/dashboard/stats'));
}

export async function getRevenueSeries(): Promise<Array<{ month: string; revenue: number; target: number }>> {
  return unwrap(httpClient.get('/dashboard/revenue-series'));
}

export async function getCourseDistribution(): Promise<Array<{ course: string; count: number }>> {
  return unwrap(httpClient.get('/dashboard/course-distribution'));
}

export async function getLeadFunnel(): Promise<Array<{ stage: string; count: number }>> {
  return unwrap(httpClient.get('/dashboard/lead-funnel'));
}

// --------------------------------------------------------------------------
// Global search
// --------------------------------------------------------------------------

export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  if (!query.trim()) return { students: [], walkIns: [], batches: [], employees: [] };
  return unwrap<GlobalSearchResults>(httpClient.get('/search', { params: { q: query } }));
}
