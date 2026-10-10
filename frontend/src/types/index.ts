// ==========================================================================
// Shared / lookup types
// ==========================================================================

export type LeadSource = 'Walk-in' | 'Website' | 'Google' | 'Instagram' | 'Referral';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Counselling'
  | 'Interested'
  | 'Admission'
  | 'Not Interested';

export type StudentStatus = 'Active' | 'On Hold' | 'Completed' | 'Dropped';

export type StudentMode = 'Online' | 'Offline' | 'Hybrid';

export type Gender = 'Male' | 'Female' | 'Other';

export type EmployeeType =
  | 'Trainer'
  | 'Developer'
  | 'Designer'
  | 'Video Editor'
  | 'Digital Marketing'
  | 'Counsellor';

export type EmployeeStatus = 'Active' | 'Inactive';

export type BatchStatus = 'Upcoming' | 'Ongoing' | 'Completed';

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type SubmissionStatus = 'Pending' | 'Submitted' | 'Needs Revision' | 'Resubmitted' | 'Reviewed' | 'Overdue';

export type ClassReportTaskStatus = 'Not Given' | 'Given' | 'Reviewed';

export const COURSES = [
  'Full Stack Development',
  'Data Science',
  'UI/UX Design',
  'Digital Marketing',
  'Python Programming',
  'Java Programming',
] as const;

// Course names are now managed dynamically via the Courses CRUD page, so the
// `Course` type is a plain string (the course's current name) rather than a
// fixed compile-time union. `COURSES` above is only used to seed the initial
// demo data.
export type Course = string;

export type CourseStatus = 'Active' | 'Inactive';

export interface CourseRecord {
  id: string;
  name: string;
  duration: string;
  fee: number;
  description: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 1 — Walk-in
// ==========================================================================

export interface WalkIn {
  id: string;
  name: string;
  mobile: string;
  email: string;
  courseInterested: Course;
  courseInterestedId: string;
  batchId?: string | null;
  batch?: { id: string; name: string };
  qualification: string;
  location: string;
  source: LeadSource;
  counsellorId: string;
  enquiryDate: string;
  remarks: string;
  followUpDate: string;
  status: LeadStatus;
  convertedStudentId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 2 — Student registration
// ==========================================================================

export interface Student {
  id: string;
  studentId: string;
  name: string;
  photo: string;
  mobile: string;
  email: string;
  dob: string;
  gender: Gender;
  address: string;
  qualification: string;
  course: Course;
  courseId: string;
  courseDuration: string;
  joiningDate: string;
  batchId: string;
  mode: StudentMode;
  counsellorId: string;
  status: StudentStatus;
  walkInId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 3 — Admission & fee
// ==========================================================================

export interface PaymentEntry {
  id: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  remarks: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  courseFee: number;
  discount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  nextPaymentDate: string;
  remarks: string;
  payments: PaymentEntry[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 4 — Batch management
// ==========================================================================

export interface Batch {
  id: string;
  batchId: string;
  course: Course;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  classTiming: string;
  days: string[];
  trainerId: string;
  studentIds: string[];
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 5 — Employee / trainer
// ==========================================================================

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  type: EmployeeType;
  email: string;
  phone: string;
  status: EmployeeStatus;
  joiningDate: string;
  assignedBatchIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 7 — Class / training report
// ==========================================================================

export interface ClassReport {
  id: string;
  date: string;
  batchId: string;
  trainerId: string;
  topic: string;
  module: string;
  description: string;
  tasksGiven: string;
  taskStatus: ClassReportTaskStatus;
  studentPerformance: string;
  remarks: string;
  nextClassPlan: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 9 — Tasks & submissions
// ==========================================================================

export interface UploadedFileRef {
  id?: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt?: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  studentId: string;
  student?: { id: string; name: string; studentCode: string };
  status: SubmissionStatus;
  content: string;
  submittedAt: string | null;
  trainerFeedback: string;
  reviewedAt: string | null;
  reviewedById: string | null;
  files: UploadedFileRef[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubmissionCounts {
  total: number;
  submitted: number;
  reviewed: number;
  pending: number;
  needsRevision: number;
  overdue: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  priority: TaskPriority;
  batchId?: string | null;
  batch?: { id: string; name: string; batchCode: string };
  createdById?: string | null;
  assignmentType: 'individual' | 'batch';
  attachments: UploadedFileRef[];
  submissionCounts: TaskSubmissionCounts;
  submissions: TaskSubmission[];
  createdAt: string;
  updatedAt: string;
}

/** A student's own task list item: their submission, plus the task info. */
export interface MyTask extends TaskSubmission {
  task: {
    id: string;
    title: string;
    description: string;
    assignedDate: string;
    dueDate: string;
    priority: TaskPriority;
    batch?: { id: string; name: string };
    attachments: UploadedFileRef[];
  };
}

export interface CreateTaskInput {
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  priority: TaskPriority;
  studentId?: string;
  batchId?: string;
  attachments?: UploadedFileRef[];
}

// ==========================================================================
// Module 10 — Student performance
// ==========================================================================

export interface PerformanceRecord {
  id: string;
  studentId: string;
  date: string;
  technicalKnowledge: number;
  practicalSkills: number;
  communication: number;
  attendance: number;
  taskCompletion: number;
  behaviour: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================================================
// Module 11 — Attendance
// ==========================================================================

export interface AttendanceRecord {
  id: string;
  studentId: string;
  batchId: string;
  date: string;
  status: AttendanceStatus;
  createdAt: string;
}

// ==========================================================================
// Auth
// ==========================================================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Permission keys granted to this user's role (from the server). UI hints only. */
  permissions: string[];
  department: string;
  phone: string;
  status: 'Active';
  avatar: string;
  mustChangePassword: boolean;
  studentId?: string | null;
  employeeId?: string | null;
}

// ==========================================================================
// Derived / computed view models
// ==========================================================================

export interface FeeSummary {
  courseFee: number;
  discount: number;
  finalFee: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

export interface StudentDashboardStats {
  courseProgress: number;
  attendancePercentage: number;
  classesCompleted: number;
  classesPending: number;
  feePaid: number;
  feePending: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalWalkIns: number;
  newLeadsThisWeek: number;
  totalBatches: number;
  ongoingBatches: number;
  totalEmployees: number;
  totalTrainers: number;
  totalRevenue: number;
  pendingFees: number;
  avgAttendance: number;
  admissionsThisMonth: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface SearchResultGroup<T> {
  label: string;
  items: T[];
}

export interface GlobalSearchResults {
  students: Array<{ id: string; title: string; subtitle: string }>;
  walkIns: Array<{ id: string; title: string; subtitle: string }>;
  batches: Array<{ id: string; title: string; subtitle: string }>;
  employees: Array<{ id: string; title: string; subtitle: string }>;
}
