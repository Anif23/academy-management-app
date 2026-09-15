const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const COURSES = [
  { name: 'Full Stack Development', duration: '6 Months', fee: 60000 },
  { name: 'Data Science', duration: '8 Months', fee: 75000 },
  { name: 'UI/UX Design', duration: '4 Months', fee: 45000 },
  { name: 'Digital Marketing', duration: '3 Months', fee: 30000 },
  { name: 'Python Programming', duration: '3 Months', fee: 25000 },
  { name: 'Java Programming', duration: '4 Months', fee: 35000 },
];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Ishaan', 'Rohan', 'Kabir', 'Arjun', 'Sai', 'Ananya', 'Diya', 'Priya', 'Sneha', 'Meera', 'Kavya', 'Riya', 'Neha', 'Rahul', 'Amit', 'Vikram', 'Sanjay', 'Pooja', 'Nisha', 'Deepak', 'Manoj', 'Anjali', 'Shreya', 'Karan', 'Varun', 'Tanvi', 'Isha'];
const LAST_NAMES = ['Mathew', 'Nair', 'Menon', 'Pillai', 'Sharma', 'Verma', 'Iyer', 'Reddy', 'Gupta', 'Das', 'Rao', 'Joseph', 'Thomas', 'Krishnan', 'Bhat', 'Kumar'];
const LOCATIONS = ['Kochi', 'Bangalore', 'Chennai', 'Hyderabad', 'Trivandrum', 'Coimbatore', 'Pune', 'Mumbai'];
const QUALIFICATIONS = ['B.Tech', 'B.Sc', 'B.Com', 'MCA', 'M.Sc', 'Diploma', '12th Grade', 'BBA'];

function pick(arr, seed) {
  return arr[seed % arr.length];
}
function fullName(seed) {
  return `${pick(FIRST_NAMES, seed)} ${pick(LAST_NAMES, seed * 7 + 3)}`;
}
function phone(seed) {
  return `9${(700000000 + seed * 137).toString().slice(0, 9)}`;
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d;
}

async function safeDeleteMany(action, modelName) {
  try {
    await action();
  } catch (error) {
    if (error?.code === 'P2021') {
      console.log(`Skipping reset for missing table: ${modelName}`);
      return;
    }
    throw error;
  }
}

async function resetSeedData() {
  await safeDeleteMany(() => prisma.task.deleteMany(), 'tasks');
  await safeDeleteMany(() => prisma.attendance.deleteMany(), 'attendance');
  await safeDeleteMany(() => prisma.classReport.deleteMany(), 'class_reports');
  await safeDeleteMany(() => prisma.payment.deleteMany(), 'payments');
  await safeDeleteMany(() => prisma.performance.deleteMany(), 'performance');
  await safeDeleteMany(() => prisma.fee.deleteMany(), 'fees');
  await safeDeleteMany(() => prisma.student.deleteMany(), 'students');
  await safeDeleteMany(() => prisma.walkIn.deleteMany(), 'walk_ins');
  await safeDeleteMany(() => prisma.batch.deleteMany(), 'batches');
  await safeDeleteMany(() => prisma.employee.deleteMany(), 'employees');
  await safeDeleteMany(() => prisma.refreshToken.deleteMany(), 'refresh_tokens');
  await safeDeleteMany(() => prisma.user.deleteMany(), 'users');
  await safeDeleteMany(() => prisma.course.deleteMany(), 'courses');
}

async function main() {
  console.log('Seeding database...');
  await resetSeedData();

  // --- Demo login accounts (one per role) -------------------------------
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@academypro.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@academypro.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      department: 'Academy Operations',
      phone: '9876543210',
    },
  });

  // --- Courses ------------------------------------------------------------
  const courses = [];
  for (const c of COURSES) {
    const course = await prisma.course.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, duration: c.duration, fee: c.fee, status: 'ACTIVE', description: `${c.name} program covering core skills and hands-on projects.` },
    });
    courses.push(course);
  }
  const courseByName = Object.fromEntries(courses.map((c) => [c.name, c]));

  // --- Employees ------------------------------------------------------------
  const employeeSpecs = [
    ...Array(6).fill('TRAINER'),
    'DEVELOPER',
    'DESIGNER',
    'VIDEO_EDITOR',
    'DIGITAL_MARKETING',
    ...Array(3).fill('COUNSELLOR'),
  ];
  const employees = [];
  for (let i = 0; i < employeeSpecs.length; i++) {
    const name = fullName(i + 1);
    const employee = await prisma.employee.create({
      data: {
        employeeCode: `EMP-2026-${(i + 1).toString().padStart(3, '0')}`,
        name,
        type: employeeSpecs[i],
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${i}@academypro.com`,
        phone: phone(i + 11),
        status: i === employeeSpecs.length - 1 ? 'INACTIVE' : 'ACTIVE',
        joiningDate: daysAgo(400 - i * 10),
      },
    });
    employees.push(employee);
  }
  const trainers = employees.filter((e) => e.type === 'TRAINER');
  const counsellors = employees.filter((e) => e.type === 'COUNSELLOR');

  // Give the STAFF demo login a real employee profile to link to.
  const staffEmployee = trainers[0];
  await prisma.user.upsert({
    where: { email: 'trainer@academypro.com' },
    update: {},
    create: {
      name: staffEmployee.name,
      email: 'trainer@academypro.com',
      passwordHash: await bcrypt.hash('staff123', 12),
      role: 'STAFF',
      department: 'Training',
      phone: staffEmployee.phone,
      employee: { connect: { id: staffEmployee.id } },
    },
  });

  // --- Batches ------------------------------------------------------------
  const batchConfigs = [
    { course: 'Full Stack Development', code: 'FS-FEB-01', startOffset: -150, endOffset: 30, status: 'ONGOING', timing: '9:00 AM - 11:00 AM', days: ['Mon', 'Wed', 'Fri'] },
    { course: 'Full Stack Development', code: 'FS-APR-01', startOffset: -60, endOffset: 120, status: 'ONGOING', timing: '6:00 PM - 8:00 PM', days: ['Mon', 'Wed', 'Fri'] },
    { course: 'Data Science', code: 'DS-MAR-01', startOffset: -90, endOffset: 60, status: 'ONGOING', timing: '11:30 AM - 1:30 PM', days: ['Tue', 'Thu', 'Sat'] },
    { course: 'UI/UX Design', code: 'UX-JAN-01', startOffset: -200, endOffset: -20, status: 'COMPLETED', timing: '3:00 PM - 5:00 PM', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    { course: 'Digital Marketing', code: 'DM-MAY-01', startOffset: -20, endOffset: 70, status: 'ONGOING', timing: '6:00 PM - 8:00 PM', days: ['Sat', 'Sun'] },
    { course: 'Python Programming', code: 'PY-JUN-01', startOffset: 15, endOffset: 105, status: 'UPCOMING', timing: '9:00 AM - 11:00 AM', days: ['Mon', 'Wed', 'Fri'] },
    { course: 'Java Programming', code: 'JV-FEB-02', startOffset: -120, endOffset: -10, status: 'COMPLETED', timing: '11:30 AM - 1:30 PM', days: ['Tue', 'Thu', 'Sat'] },
    { course: 'Data Science', code: 'DS-JUL-01', startOffset: 40, endOffset: 130, status: 'UPCOMING', timing: '3:00 PM - 5:00 PM', days: ['Sat', 'Sun'] },
  ];

  const batches = [];
  for (let i = 0; i < batchConfigs.length; i++) {
    const c = batchConfigs[i];
    const batch = await prisma.batch.create({
      data: {
        batchCode: c.code,
        name: `${c.course} — ${c.code}`,
        courseId: courseByName[c.course].id,
        startDate: daysAgo(-c.startOffset),
        endDate: daysAgo(-c.endOffset),
        classTiming: c.timing,
        days: c.days,
        trainerId: pick(trainers, i).id,
        status: c.status,
      },
    });
    batches.push(batch);
  }

  // --- Walk-ins ------------------------------------------------------------
  const sources = ['WALK_IN', 'WEBSITE', 'GOOGLE', 'INSTAGRAM', 'REFERRAL'];
  const leadStatuses = ['NEW', 'CONTACTED', 'COUNSELLING', 'INTERESTED', 'ADMISSION', 'NOT_INTERESTED'];
  for (let i = 0; i < 26; i++) {
    const seed = i + 50;
    await prisma.walkIn.create({
      data: {
        name: fullName(seed),
        mobile: phone(seed),
        email: `${fullName(seed).toLowerCase().replace(/\s+/g, '.')}${seed}@mail.com`,
        courseInterestedId: pick(courses, seed).id,
        qualification: pick(QUALIFICATIONS, seed),
        location: pick(LOCATIONS, seed),
        source: pick(sources, seed),
        counsellorId: pick(counsellors, seed).id,
        enquiryDate: daysAgo(60 - i * 2),
        remarks: pick(['Interested in weekend batch.', 'Wants fee structure via email.', 'Compared with other institutes.', 'Referred by a current student.'], seed),
        followUpDate: daysFromNow((i % 5) - 2),
        status: pick(leadStatuses, seed),
      },
    });
  }

  // --- Students (+ auto fee + auto baseline performance) -------------------
  const genders = ['MALE', 'FEMALE'];
  const modes = ['ONLINE', 'OFFLINE', 'HYBRID'];
  const nonCompletedBatches = batches.filter((b) => b.status !== 'COMPLETED');
  const students = [];

  for (let i = 0; i < 48; i++) {
    const seed = i + 200;
    const batch = pick(i % 4 === 0 ? batches : nonCompletedBatches, i);
    const course = courses.find((c) => c.id === batch.courseId);
    const joiningDate = batch.startDate;
    const statusPool = batch.status === 'COMPLETED' ? ['COMPLETED', 'COMPLETED', 'DROPPED'] : ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ON_HOLD'];
    const name = fullName(seed);

    const student = await prisma.student.create({
      data: {
        studentCode: `STU-2026-${(i + 1).toString().padStart(5, '0')}`,
        name,
        mobile: phone(seed),
        email: `${name.toLowerCase().replace(/\s+/g, '.')}${seed}@mail.com`,
        dob: new Date(1998 + (i % 8), i % 9, 10 + (i % 9)),
        gender: pick(genders, seed),
        address: `${12 + i}, MG Road, ${pick(LOCATIONS, seed)}`,
        qualification: pick(QUALIFICATIONS, seed),
        courseId: course.id,
        courseDuration: course.duration,
        joiningDate,
        batchId: batch.id,
        mode: pick(modes, seed),
        counsellorId: pick(counsellors, seed).id,
        status: pick(statusPool, seed),
      },
    });
    students.push(student);

    const discount = pick([0, 2000, 5000, 7500, 10000], i);
    const finalFee = Number(course.fee) - discount;
    const paidRatio = student.status === 'COMPLETED' ? 1 : pick([0.3, 0.5, 0.65, 0.8, 1], i);
    const paidAmount = Math.round((finalFee * paidRatio) / 500) * 500;
    const paymentModes = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE'];

    const fee = await prisma.fee.create({
      data: { studentId: student.id, courseFee: course.fee, discount },
    });

    const firstPayment = Math.round(paidAmount * 0.5);
    await prisma.payment.create({
      data: { feeId: fee.id, amount: firstPayment, date: joiningDate, mode: pick(paymentModes, i), remarks: 'Initial admission payment.' },
    });
    if (paidAmount > firstPayment) {
      await prisma.payment.create({
        data: { feeId: fee.id, amount: paidAmount - firstPayment, date: daysAgo(20 - (i % 15)), mode: pick(paymentModes, i + 3), remarks: 'Installment payment.' },
      });
    }

    await prisma.performance.create({
      data: {
        studentId: student.id,
        date: daysAgo(7),
        technicalKnowledge: Math.min(10, 5 + (seed % 5)),
        practicalSkills: Math.min(10, 5 + (seed % 4)),
        communication: Math.min(10, 5 + (seed % 3)),
        attendance: Math.min(10, 5 + (seed % 6)),
        taskCompletion: Math.min(10, 5 + (seed % 4)),
        behaviour: Math.min(10, 6 + (seed % 3)),
        remarks: pick(['Consistent performer.', 'Shows strong improvement.', 'Needs more practice time.'], seed),
      },
    });
  }

  // Give the STUDENT demo login a real student profile.
  const demoStudent = students[0];
  await prisma.user.upsert({
    where: { email: 'student@academypro.com' },
    update: {},
    create: {
      name: demoStudent.name,
      email: 'student@academypro.com',
      passwordHash: await bcrypt.hash('student123', 12),
      role: 'STUDENT',
      phone: demoStudent.mobile,
      student: { connect: { id: demoStudent.id } },
    },
  });

  // --- Attendance ------------------------------------------------------------
  const attendanceRows = [];
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const sessionCount = 20 + (i % 10);
    for (let d = 0; d < sessionCount; d++) {
      const roll = (i * 7 + d * 3) % 10;
      const status = roll < 7 ? 'PRESENT' : roll < 9 ? 'ABSENT' : 'LEAVE';
      attendanceRows.push({ studentId: student.id, batchId: student.batchId, date: daysAgo(sessionCount - d), status });
    }
  }
  // createMany in chunks to avoid one giant statement.
  for (let i = 0; i < attendanceRows.length; i += 500) {
    await prisma.attendance.createMany({ data: attendanceRows.slice(i, i + 500), skipDuplicates: true });
  }

  // --- Class reports (dates drawn from real attendance so figures line up) ---
  const topicsByCourse = {
    'Full Stack Development': ['React Hooks', 'REST APIs', 'Node.js & Express', 'Database Design'],
    'Data Science': ['Pandas Basics', 'Data Visualization', 'Regression Models'],
    'UI/UX Design': ['Wireframing', 'Design Systems', 'Usability Testing'],
    'Digital Marketing': ['SEO Fundamentals', 'Google Ads', 'Social Media Strategy'],
    'Python Programming': ['Data Structures', 'OOP in Python', 'File Handling'],
    'Java Programming': ['Core Java Syntax', 'OOP Concepts', 'Collections Framework'],
  };
  const uniquePairs = new Map();
  attendanceRows.forEach((r) => uniquePairs.set(`${r.batchId}|${r.date.toISOString()}`, r));
  const pairs = Array.from(uniquePairs.values()).slice(0, 40);

  for (let i = 0; i < pairs.length; i++) {
    const { batchId, date } = pairs[i];
    const batch = batches.find((b) => b.id === batchId);
    const course = courses.find((c) => c.id === batch.courseId);
    const topics = topicsByCourse[course.name] || ['General Session'];
    await prisma.classReport.create({
      data: {
        date,
        batchId,
        trainerId: batch.trainerId,
        topic: pick(topics, i),
        module: `Module ${(i % 5) + 1}`,
        description: `Covered ${pick(topics, i).toLowerCase()} with hands-on practice and live examples.`,
        tasksGiven: 'Practice assignment shared on the class portal.',
        taskStatus: pick(['GIVEN', 'REVIEWED', 'NOT_GIVEN'], i),
        studentPerformance: pick(['Good engagement overall.', 'A few students need revision.', 'Excellent participation.'], i),
        remarks: pick(['On track with the syllabus.', 'Slightly behind schedule.', 'Ahead of plan.'], i),
        nextClassPlan: `Continue with ${pick(topics, i + 1)}.`,
      },
    });
  }

  // --- Tasks ------------------------------------------------------------
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];
  const taskStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  const taskTitles = ['Build a responsive landing page', 'Write unit tests for module', 'Create wireframes for dashboard', 'Prepare presentation deck', 'Implement CRUD API', 'Analyze sample dataset'];
  for (let i = 0; i < students.length; i++) {
    const taskCount = 1 + (i % 3);
    for (let t = 0; t < taskCount; t++) {
      const seed = i * 3 + t;
      await prisma.task.create({
        data: {
          studentId: students[i].id,
          title: pick(taskTitles, seed),
          description: 'Complete the assigned task and submit before the due date for review.',
          assignedDate: daysAgo(10 - t),
          dueDate: daysFromNow(t * 2 + 1),
          priority: pick(priorities, seed),
          status: pick(taskStatuses, seed),
          trainerRemarks: pick(['Good progress so far.', '', 'Needs improvement on structure.'], seed),
        },
      });
    }
  }

  console.log('Seed complete.');
  console.log('Demo accounts:');
  console.log('  Admin:   admin@academypro.com   / admin123');
  console.log('  Staff:   trainer@academypro.com  / staff123');
  console.log('  Student: student@academypro.com  / student123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
