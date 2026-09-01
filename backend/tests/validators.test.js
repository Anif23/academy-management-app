const { loginSchema } = require('../src/validators/authValidators');
const { createStudentSchema } = require('../src/validators/studentValidators');
const { createBatchSchema } = require('../src/validators/batchValidators');

describe('loginSchema', () => {
  test('accepts a valid email/password', () => {
    const result = loginSchema.parse({ email: 'Admin@Example.com', password: 'anything' });
    expect(result.email).toBe('admin@example.com'); // normalized to lowercase
  });

  test('rejects an invalid email', () => {
    expect(() => loginSchema.parse({ email: 'not-an-email', password: 'x' })).toThrow();
  });

  test('rejects an empty password', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com', password: '' })).toThrow();
  });
});

describe('createStudentSchema', () => {
  const validStudent = {
    name: 'Jane Doe',
    mobile: '9876543210',
    email: 'jane@example.com',
    gender: 'Female',
    address: '123 Main Street',
    qualification: 'B.Tech',
    courseId: 'course_1',
    courseDuration: '6 Months',
    joiningDate: '2026-01-01',
    batchId: 'batch_1',
    mode: 'Offline',
    counsellorId: 'emp_1',
  };

  test('accepts a fully valid student payload', () => {
    expect(() => createStudentSchema.parse(validStudent)).not.toThrow();
  });

  test('rejects a mobile number that is not 10 digits', () => {
    expect(() => createStudentSchema.parse({ ...validStudent, mobile: '12345' })).toThrow();
  });

  test('rejects an unknown gender value', () => {
    expect(() => createStudentSchema.parse({ ...validStudent, gender: 'Unspecified' })).toThrow();
  });

  test('rejects a missing batchId', () => {
    const { batchId, ...withoutBatch } = validStudent;
    expect(() => createStudentSchema.parse(withoutBatch)).toThrow();
  });
});

describe('createBatchSchema', () => {
  test('rejects when endDate is before startDate', () => {
    expect(() =>
      createBatchSchema.parse({
        batchId: 'FS-01',
        courseId: 'course_1',
        name: 'Batch One',
        startDate: '2026-06-01',
        endDate: '2026-01-01',
        classTiming: '6-8 PM',
        days: ['Mon'],
        trainerId: 'emp_1',
      }),
    ).toThrow();
  });

  test('accepts a valid date range', () => {
    expect(() =>
      createBatchSchema.parse({
        batchId: 'FS-01',
        courseId: 'course_1',
        name: 'Batch One',
        startDate: '2026-01-01',
        endDate: '2026-06-01',
        classTiming: '6-8 PM',
        days: ['Mon'],
        trainerId: 'emp_1',
      }),
    ).not.toThrow();
  });
});
