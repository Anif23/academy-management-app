jest.mock('../src/config/prisma', () => ({}));
jest.mock('../src/utils/staffScope', () => ({
  staffOwnsStudent: jest.fn(),
  getStaffBatchIds: jest.fn(),
}));

const { assertCanAccessStudent } = require('../src/controllers/studentController');
const { staffOwnsStudent } = require('../src/utils/staffScope');

describe('assertCanAccessStudent — IDOR protection', () => {
  beforeEach(() => {
    staffOwnsStudent.mockResolvedValue(false);
  });

  test('throws 403 when a STUDENT requests a different studentId', async () => {
    const req = { user: { role: 'STUDENT', studentId: 'stu_self' } };
    await expect(assertCanAccessStudent(req, 'stu_someone_else')).rejects.toMatchObject({
      statusCode: 403,
      errorCode: 'IDOR_BLOCKED',
    });
  });

  test('allows a STUDENT to request their own studentId', async () => {
    const req = { user: { role: 'STUDENT', studentId: 'stu_self' } };
    await expect(assertCanAccessStudent(req, 'stu_self')).resolves.toBeUndefined();
  });

  test('ADMIN can access any studentId', async () => {
    const req = { user: { role: 'ADMIN', studentId: null } };
    await expect(assertCanAccessStudent(req, 'any_student_id')).resolves.toBeUndefined();
  });

  test('STAFF can access only students in their assigned scope', async () => {
    const req = { user: { role: 'STAFF', employeeId: 'trainer_1' } };
    await expect(assertCanAccessStudent(req, 'student_1')).rejects.toMatchObject({
      statusCode: 403,
      errorCode: 'NOT_YOUR_STUDENT',
    });

    staffOwnsStudent.mockResolvedValue(true);
    await expect(assertCanAccessStudent(req, 'student_1')).resolves.toBeUndefined();
    expect(staffOwnsStudent).toHaveBeenCalledWith('trainer_1', 'student_1');
  });
});
