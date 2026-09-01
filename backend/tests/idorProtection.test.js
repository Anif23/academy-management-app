jest.mock('../src/config/prisma', () => ({}));

const { assertCanAccessStudent } = require('../src/controllers/studentController');
const ApiError = require('../src/utils/ApiError');

describe('assertCanAccessStudent — IDOR protection', () => {
  test('throws 403 when a STUDENT requests a different studentId', () => {
    const req = { user: { role: 'STUDENT', studentId: 'stu_self' } };
    expect(() => assertCanAccessStudent(req, 'stu_someone_else')).toThrow(ApiError);
    try {
      assertCanAccessStudent(req, 'stu_someone_else');
    } catch (err) {
      expect(err.statusCode).toBe(403);
      expect(err.errorCode).toBe('IDOR_BLOCKED');
    }
  });

  test('allows a STUDENT to request their own studentId', () => {
    const req = { user: { role: 'STUDENT', studentId: 'stu_self' } };
    expect(() => assertCanAccessStudent(req, 'stu_self')).not.toThrow();
  });

  test('ADMIN can access any studentId', () => {
    const req = { user: { role: 'ADMIN', studentId: null } };
    expect(() => assertCanAccessStudent(req, 'any_student_id')).not.toThrow();
  });

  test('STAFF can access any studentId', () => {
    const req = { user: { role: 'STAFF', studentId: null } };
    expect(() => assertCanAccessStudent(req, 'any_student_id')).not.toThrow();
  });
});
