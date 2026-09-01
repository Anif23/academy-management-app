jest.mock('../src/config/prisma', () => ({
  student: {
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
  },
  employee: {
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
  },
  course: {
    findUnique: jest.fn().mockResolvedValue({ id: 'course_1', fee: 1200 }),
  },
  fee: {
    create: jest.fn().mockResolvedValue({}),
  },
  performance: {
    create: jest.fn().mockResolvedValue({}),
  },
  walkIn: {
    update: jest.fn().mockResolvedValue({}),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
}));

const { comparePassword } = require('../src/utils/password');
const prisma = require('../src/config/prisma');
const studentService = require('../src/services/studentService');
const employeeService = require('../src/services/employeeService');

describe('Automatic linked account creation for profile records', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('student creation auto-checks for an existing user and creates a linked STUDENT account using the email as the default password', async () => {
    const tx = {
      student: {
        create: jest.fn().mockResolvedValue({
          id: 'student_1',
          studentCode: 'STU-2026-00001',
          name: 'Jane Student',
          photo: '',
          mobile: '9999999999',
          email: 'jane@student.com',
          dob: '2002-01-01',
          gender: 'FEMALE',
          address: 'Main Street',
          qualification: 'B.Com',
          courseId: 'course_1',
          courseDuration: '12 Months',
          joiningDate: '2026-09-01',
          batchId: 'batch_1',
          mode: 'OFFLINE',
          counsellorId: 'emp_1',
          status: 'ACTIVE',
          walkInId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          course: { name: 'Web Development' },
        }),
      },
      fee: { create: jest.fn().mockResolvedValue({}) },
      performance: { create: jest.fn().mockResolvedValue({}) },
      walkIn: { update: jest.fn().mockResolvedValue({}) },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'user_student_1' }),
      },
    };

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await studentService.create({
      name: 'Jane Student',
      mobile: '9999999999',
      email: 'jane@student.com',
      dob: '2002-01-01',
      gender: 'Female',
      address: 'Main Street',
      qualification: 'B.Com',
      courseId: 'course_1',
      courseDuration: '12 Months',
      joiningDate: '2026-09-01',
      batchId: 'batch_1',
      mode: 'Offline',
      counsellorId: 'emp_1',
      status: 'Active',
    });

    expect(tx.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'jane@student.com' } }),
    );
    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'jane@student.com',
          name: 'Jane Student',
          role: 'STUDENT',
          student: { connect: { id: 'student_1' } },
        }),
      }),
    );
    const userPayload = tx.user.create.mock.calls[0][0].data;
    expect(await comparePassword('jane@student.com', userPayload.passwordHash)).toBe(true);
  });

  test('staff creation auto-checks for an existing user and creates a linked STAFF account using the email as the default password', async () => {
    const employee = {
      id: 'emp_1',
      employeeCode: 'EMP-2026-001',
      name: 'Alex Staff',
      type: 'TRAINER',
      email: 'alex@academy.com',
      phone: '7777777777',
      status: 'ACTIVE',
      joiningDate: '2026-09-01',
      trainerBatches: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tx = {
      employee: { create: jest.fn().mockResolvedValue(employee) },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'user_staff_1' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await employeeService.create({
      name: 'Alex Staff',
      type: 'Trainer',
      email: 'alex@academy.com',
      phone: '7777777777',
      status: 'Active',
      joiningDate: '2026-09-01',
    });

    expect(tx.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'alex@academy.com' } }),
    );
    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'alex@academy.com',
          name: 'Alex Staff',
          role: 'STAFF',
          employee: { connect: { id: 'emp_1' } },
        }),
      }),
    );
    const userPayload = tx.user.create.mock.calls[0][0].data;
    expect(await comparePassword('alex@academy.com', userPayload.passwordHash)).toBe(true);
  });
});
