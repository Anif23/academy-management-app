import type {
  AttendanceRecord,
  Batch,
  ClassReport,
  Course,
  CourseRecord,
  Employee,
  FeeRecord,
  PerformanceRecord,
  Student,
  StudentTask,
  WalkIn,
} from '../types';
import { COURSES } from '../types';

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString().padStart(4, '0')}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Ishaan', 'Rohan', 'Kabir', 'Arjun', 'Sai',
  'Ananya', 'Diya', 'Priya', 'Sneha', 'Meera', 'Kavya', 'Riya', 'Neha',
  'Rahul', 'Amit', 'Vikram', 'Sanjay', 'Pooja', 'Nisha', 'Deepak', 'Manoj',
  'Anjali', 'Shreya', 'Karan', 'Varun', 'Tanvi', 'Isha',
];

const LAST_NAMES = [
  'Mathew', 'Nair', 'Menon', 'Pillai', 'Sharma', 'Verma', 'Iyer', 'Reddy',
  'Gupta', 'Das', 'Rao', 'Joseph', 'Thomas', 'Krishnan', 'Bhat', 'Kumar',
];

const LOCATIONS = ['Kochi', 'Bangalore', 'Chennai', 'Hyderabad', 'Trivandrum', 'Coimbatore', 'Pune', 'Mumbai'];

function fullName(seed: number): string {
  return `${pick(FIRST_NAMES, seed)} ${pick(LAST_NAMES, seed * 7 + 3)}`;
}

function phone(seed: number): string {
  return `9${(700000000 + seed * 137).toString().slice(0, 9)}`;
}

// --------------------------------------------------------------------------
// Employees
// --------------------------------------------------------------------------

export function seedEmployees(): Employee[] {
  const types: Employee['type'][] = [
    'Trainer', 'Trainer', 'Trainer', 'Trainer', 'Trainer', 'Trainer',
    'Developer', 'Designer', 'Video Editor', 'Digital Marketing',
    'Counsellor', 'Counsellor', 'Counsellor',
  ];

  return types.map((type, i) => {
    const name = fullName(i + 1);
    const id = nextId('EMP');
    return {
      id,
      employeeId: `EMP-2026-${(i + 1).toString().padStart(3, '0')}`,
      name,
      type,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@acadmey.com`,
      phone: phone(i + 11),
      status: i === types.length - 1 ? 'Inactive' : 'Active',
      joiningDate: isoDaysAgo(400 - i * 10),
      assignedBatchIds: [],
      createdAt: isoDaysAgo(400 - i * 10),
      updatedAt: isoDaysAgo(30),
    };
  });
}

// --------------------------------------------------------------------------
// Batches
// --------------------------------------------------------------------------

const DAY_SETS = [
  ['Mon', 'Wed', 'Fri'],
  ['Tue', 'Thu', 'Sat'],
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  ['Sat', 'Sun'],
];

export function seedBatches(trainers: Employee[]): Batch[] {
  const configs: Array<{ course: Course; code: string; startOffset: number; endOffset: number; status: Batch['status'] }> = [
    { course: 'Full Stack Development', code: 'FS-FEB-01', startOffset: -150, endOffset: 30, status: 'Ongoing' },
    { course: 'Full Stack Development', code: 'FS-APR-01', startOffset: -60, endOffset: 120, status: 'Ongoing' },
    { course: 'Data Science', code: 'DS-MAR-01', startOffset: -90, endOffset: 60, status: 'Ongoing' },
    { course: 'UI/UX Design', code: 'UX-JAN-01', startOffset: -200, endOffset: -20, status: 'Completed' },
    { course: 'Digital Marketing', code: 'DM-MAY-01', startOffset: -20, endOffset: 70, status: 'Ongoing' },
    { course: 'Python Programming', code: 'PY-JUN-01', startOffset: 15, endOffset: 105, status: 'Upcoming' },
    { course: 'Java Programming', code: 'JV-FEB-02', startOffset: -120, endOffset: -10, status: 'Completed' },
    { course: 'Data Science', code: 'DS-JUL-01', startOffset: 40, endOffset: 130, status: 'Upcoming' },
  ];

  return configs.map((c, i) => {
    const trainer = pick(trainers, i);
    return {
      id: nextId('BATCH'),
      batchId: c.code,
      course: c.course,
      name: `${c.course} — ${c.code}`,
      startDate: isoDaysAgo(-c.startOffset),
      endDate: isoDaysAgo(-c.endOffset),
      classTiming: pick(['9:00 AM - 11:00 AM', '11:30 AM - 1:30 PM', '3:00 PM - 5:00 PM', '6:00 PM - 8:00 PM'], i),
      days: pick(DAY_SETS, i),
      trainerId: trainer.id,
      studentIds: [],
      status: c.status,
      createdAt: isoDaysAgo(-c.startOffset + 5),
      updatedAt: isoDaysAgo(5),
    };
  });
}

// --------------------------------------------------------------------------
// Walk-ins
// --------------------------------------------------------------------------

const SOURCES: WalkIn['source'][] = ['Walk-in', 'Website', 'Google', 'Instagram', 'Referral'];
const LEAD_STATUSES: WalkIn['status'][] = ['New', 'Contacted', 'Counselling', 'Interested', 'Admission', 'Not Interested'];
const QUALIFICATIONS = ['B.Tech', 'B.Sc', 'B.Com', 'MCA', 'M.Sc', 'Diploma', '12th Grade', 'BBA'];

export function seedWalkIns(counsellors: Employee[], count = 26): WalkIn[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 50;
    const enquiryDate = isoDaysAgo(60 - i * 2);
    return {
      id: nextId('WI'),
      name: fullName(seed),
      mobile: phone(seed),
      email: `${fullName(seed).toLowerCase().replace(/\s+/g, '.')}@mail.com`,
      courseInterested: pick(COURSES, seed),
      qualification: pick(QUALIFICATIONS, seed),
      location: pick(LOCATIONS, seed),
      source: pick(SOURCES, seed),
      counsellorId: pick(counsellors, seed).id,
      enquiryDate,
      remarks: pick(
        [
          'Interested in weekend batch.',
          'Wants fee structure via email.',
          'Compared with other institutes.',
          'Referred by a current student.',
          'Looking for placement assistance.',
        ],
        seed,
      ),
      followUpDate: isoDaysFromNow((i % 5) - 2),
      status: pick(LEAD_STATUSES, seed),
      createdAt: enquiryDate,
      updatedAt: isoDaysAgo(Math.max(0, 30 - i)),
    };
  });
}

// --------------------------------------------------------------------------
// Students
// --------------------------------------------------------------------------

const DURATIONS: Record<Course, string> = {
  'Full Stack Development': '6 Months',
  'Data Science': '8 Months',
  'UI/UX Design': '4 Months',
  'Digital Marketing': '3 Months',
  'Python Programming': '3 Months',
  'Java Programming': '4 Months',
};

export function seedStudents(batches: Batch[], counsellors: Employee[], count = 48): Student[] {
  const students: Student[] = Array.from({ length: count }, (_, i) => {
    const seed = i + 200;
    const batch = pick(
      batches.filter((b) => b.status !== 'Completed' || i % 4 === 0),
      i,
    );
    const joiningDate = batch.startDate;
    const statusPool: Student['status'][] =
      batch.status === 'Completed'
        ? ['Completed', 'Completed', 'Dropped']
        : ['Active', 'Active', 'Active', 'On Hold'];

    return {
      id: nextId('STU'),
      studentId: `STU-2026-${(i + 1).toString().padStart(5, '0')}`,
      name: fullName(seed),
      photo: '',
      mobile: phone(seed),
      email: `${fullName(seed).toLowerCase().replace(/\s+/g, '.')}@mail.com`,
      dob: `${1998 + (i % 8)}-0${(i % 9) + 1}-1${i % 9}`,
      gender: pick<'Male' | 'Female' | 'Other'>(['Male', 'Female'], seed),
      address: `${12 + i}, MG Road, ${pick(LOCATIONS, seed)}`,
      qualification: pick(QUALIFICATIONS, seed),
      course: batch.course,
      courseDuration: DURATIONS[batch.course],
      joiningDate,
      batchId: batch.id,
      mode: pick<'Online' | 'Offline' | 'Hybrid'>(['Online', 'Offline', 'Hybrid'], seed),
      counsellorId: pick(counsellors, seed).id,
      status: pick(statusPool, seed),
      createdAt: joiningDate,
      updatedAt: isoDaysAgo(Math.max(0, 20 - i)),
    };
  });

  batches.forEach((batch) => {
    batch.studentIds = students.filter((s) => s.batchId === batch.id).map((s) => s.id);
  });

  return students;
}

// --------------------------------------------------------------------------
// Fees
// --------------------------------------------------------------------------

export const COURSE_FEES: Record<Course, number> = {
  'Full Stack Development': 60000,
  'Data Science': 75000,
  'UI/UX Design': 45000,
  'Digital Marketing': 30000,
  'Python Programming': 25000,
  'Java Programming': 35000,
};

const PAYMENT_MODES: FeeRecord['paymentMode'][] = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];

export function seedFees(students: Student[]): FeeRecord[] {
  return students.map((student, i) => {
    const courseFee = COURSE_FEES[student.course];
    const discount = pick([0, 2000, 5000, 7500, 10000], i);
    const finalFee = courseFee - discount;
    const paidRatio = student.status === 'Completed' ? 1 : pick([0.3, 0.5, 0.65, 0.8, 1], i);
    const paidAmount = Math.round((finalFee * paidRatio) / 500) * 500;

    const payments = [
      {
        id: nextId('PMT'),
        amount: Math.round(paidAmount * 0.5),
        date: student.joiningDate,
        mode: pick(PAYMENT_MODES, i),
        remarks: 'Initial admission payment.',
      },
    ];
    if (paidAmount > payments[0].amount) {
      payments.push({
        id: nextId('PMT'),
        amount: paidAmount - payments[0].amount,
        date: isoDaysAgo(20 - (i % 15)),
        mode: pick(PAYMENT_MODES, i + 3),
        remarks: 'Installment payment.',
      });
    }

    return {
      id: nextId('FEE'),
      studentId: student.id,
      courseFee,
      discount,
      paymentDate: payments[payments.length - 1].date,
      paymentMode: payments[payments.length - 1].mode,
      nextPaymentDate: paidAmount < finalFee ? isoDaysFromNow(10 + (i % 10)) : '',
      remarks: paidAmount < finalFee ? 'Balance due next month.' : 'Fully paid.',
      payments,
      createdAt: student.joiningDate,
      updatedAt: isoDaysAgo(5),
    };
  });
}

// --------------------------------------------------------------------------
// Attendance
// --------------------------------------------------------------------------

export function seedAttendance(students: Student[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];

  students.forEach((student, i) => {
    const sessionCount = 20 + (i % 10);
    for (let d = 0; d < sessionCount; d += 1) {
      const roll = (i * 7 + d * 3) % 10;
      const status: AttendanceRecord['status'] = roll < 7 ? 'Present' : roll < 9 ? 'Absent' : 'Leave';
      records.push({
        id: nextId('ATT'),
        studentId: student.id,
        batchId: student.batchId,
        date: isoDaysAgo(sessionCount - d),
        status,
        createdAt: isoDaysAgo(sessionCount - d),
      });
    }
  });

  return records;
}

// --------------------------------------------------------------------------
// Class reports
// --------------------------------------------------------------------------

const TOPICS: Record<Course, string[]> = {
  'Full Stack Development': ['React Hooks', 'REST APIs', 'Node.js & Express', 'Database Design', 'Authentication Flows'],
  'Data Science': ['Pandas Basics', 'Data Visualization', 'Regression Models', 'Feature Engineering', 'Model Evaluation'],
  'UI/UX Design': ['Wireframing', 'Design Systems', 'Usability Testing', 'Prototyping in Figma', 'Accessibility'],
  'Digital Marketing': ['SEO Fundamentals', 'Google Ads', 'Social Media Strategy', 'Analytics', 'Content Marketing'],
  'Python Programming': ['Data Structures', 'OOP in Python', 'File Handling', 'Modules & Packages', 'Error Handling'],
  'Java Programming': ['Core Java Syntax', 'OOP Concepts', 'Collections Framework', 'Exception Handling', 'JDBC Basics'],
};

export function seedClassReports(
  batches: Batch[],
  attendance: AttendanceRecord[],
  count = 40,
): ClassReport[] {
  // Derive class-report dates from real attendance records so the "attendance
  // for this class" figure (computed live from the Attendance module) has
  // matching data to show, instead of manually duplicating present/total counts.
  const pairMap = new Map<string, { batchId: string; date: string }>();
  attendance.forEach((record) => {
    pairMap.set(`${record.batchId}|${record.date}`, { batchId: record.batchId, date: record.date });
  });
  const pairs = Array.from(pairMap.values());
  const source = pairs.length > 0 ? pairs : batches.map((b) => ({ batchId: b.id, date: isoDaysAgo(5) }));

  return Array.from({ length: Math.min(count, source.length) }, (_, i) => {
    const { batchId, date } = pick(source, i);
    const batch = batches.find((b) => b.id === batchId) ?? batches[0];

    return {
      id: nextId('CR'),
      date,
      batchId: batch.id,
      trainerId: batch.trainerId,
      topic: pick(TOPICS[batch.course], i),
      module: `Module ${(i % 5) + 1}`,
      description: `Covered ${pick(TOPICS[batch.course], i).toLowerCase()} with hands-on practice and live examples.`,
      tasksGiven: 'Practice assignment shared on the class portal.',
      taskStatus: pick<'Not Given' | 'Given' | 'Reviewed'>(['Given', 'Reviewed', 'Not Given'], i),
      studentPerformance: pick(['Good engagement overall.', 'A few students need revision.', 'Excellent participation.'], i),
      remarks: pick(['On track with the syllabus.', 'Slightly behind schedule.', 'Ahead of plan.'], i),
      nextClassPlan: `Continue with ${pick(TOPICS[batch.course], i + 1)}.`,
      createdAt: date,
      updatedAt: date,
    };
  });
}

// --------------------------------------------------------------------------
// Tasks
// --------------------------------------------------------------------------

export function seedTasks(students: Student[]): StudentTask[] {
  const priorities: StudentTask['priority'][] = ['Low', 'Medium', 'High'];
  const statuses: StudentTask['status'][] = ['Pending', 'In Progress', 'Completed'];

  return students.flatMap((student, i) => {
    const taskCount = 1 + (i % 3);
    return Array.from({ length: taskCount }, (_, t) => {
      const seed = i * 3 + t;
      return {
        id: nextId('TSK'),
        studentId: student.id,
        title: pick(
          ['Build a responsive landing page', 'Write unit tests for module', 'Create wireframes for dashboard', 'Prepare presentation deck', 'Implement CRUD API', 'Analyze sample dataset'],
          seed,
        ),
        description: 'Complete the assigned task and submit before the due date for review.',
        assignedDate: isoDaysAgo(10 - t),
        dueDate: isoDaysFromNow(t * 2 + 1),
        priority: pick(priorities, seed),
        status: pick(statuses, seed),
        trainerRemarks: pick(['Good progress so far.', '', 'Needs improvement on structure.'], seed),
        createdAt: isoDaysAgo(10 - t),
        updatedAt: isoDaysAgo(2),
      };
    });
  });
}

// --------------------------------------------------------------------------
// Performance
// --------------------------------------------------------------------------

export function seedPerformance(students: Student[]): PerformanceRecord[] {
  return students.map((student, i) => {
    const seed = i + 500;
    const base = 5 + (seed % 5);
    return {
      id: nextId('PERF'),
      studentId: student.id,
      date: isoDaysAgo(7),
      technicalKnowledge: Math.min(10, base + (seed % 3)),
      practicalSkills: Math.min(10, base + (seed % 2)),
      communication: Math.min(10, base - (seed % 2) + 1),
      attendance: Math.min(10, base + (seed % 4)),
      taskCompletion: Math.min(10, base + (seed % 3) - 1),
      behaviour: Math.min(10, base + 1),
      remarks: pick(['Consistent performer.', 'Shows strong improvement.', 'Needs more practice time.'], seed),
      createdAt: isoDaysAgo(7),
      updatedAt: isoDaysAgo(7),
    };
  });
}

// --------------------------------------------------------------------------
// Courses
// --------------------------------------------------------------------------

export function seedCourses(): CourseRecord[] {
  return COURSES.map((name, i) => {
    const now = isoDaysAgo(400 - i * 5);
    return {
      id: nextId('CRS'),
      name,
      duration: DURATIONS[name],
      fee: COURSE_FEES[name],
      description: `${name} program covering the core skills and hands-on projects needed for the field.`,
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };
  });
}

// --------------------------------------------------------------------------
// Root seed
// --------------------------------------------------------------------------

export interface SeedDatabase {
  employees: Employee[];
  batches: Batch[];
  walkIns: WalkIn[];
  students: Student[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  classReports: ClassReport[];
  tasks: StudentTask[];
  performance: PerformanceRecord[];
  courses: CourseRecord[];
}

export function buildSeedDatabase(): SeedDatabase {
  counter = 0;
  const employees = seedEmployees();
  const trainers = employees.filter((e) => e.type === 'Trainer');
  const counsellors = employees.filter((e) => e.type === 'Counsellor');

  const courses = seedCourses();
  const batches = seedBatches(trainers);
  const walkIns = seedWalkIns(counsellors);
  const students = seedStudents(batches, counsellors);

  employees.forEach((employee) => {
    if (employee.type === 'Trainer') {
      employee.assignedBatchIds = batches.filter((b) => b.trainerId === employee.id).map((b) => b.id);
    }
  });

  const fees = seedFees(students);
  const attendance = seedAttendance(students);
  const classReports = seedClassReports(batches, attendance);
  const tasks = seedTasks(students);
  const performance = seedPerformance(students);

  return { employees, batches, walkIns, students, fees, attendance, classReports, tasks, performance, courses };
}
