const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const studentService = require('../services/studentService');

const { staffOwnsStudent, getStaffBatchIds } = require('../utils/staffScope');
const { isScopedRole } = require('../constants/roles');

/**
 * A STUDENT caller may only ever see their own record — enforced here by
 * comparing the requested id against req.user.studentId, never by trusting
 * the client to only ask for its own data. A STAFF caller may only see
 * students in a batch assigned to them. Admin passes straight through,
 * already gated by requirePermission in the route.
 */
async function assertCanAccessStudent(req, studentId) {
  if (req.user.role === 'STUDENT' && req.user.studentId !== studentId) {
    throw ApiError.forbidden("You can't access another student's data.", 'IDOR_BLOCKED');
  }
  if (isScopedRole(req.user.role) && !(await staffOwnsStudent(req.user.employeeId, studentId))) {
    throw ApiError.forbidden('This student is not in one of your assigned batches.', 'NOT_YOUR_STUDENT');
  }
}

const getAll = asyncHandler(async (req, res) => {
  const result = await studentService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await studentService.getAllRaw(req.user);
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  await assertCanAccessStudent(req, req.params.id);
  const data = await studentService.getById(req.params.id);
  res.json({ success: true, data });
});

const getMe = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await studentService.getById(req.user.studentId);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await studentService.create(req.body, req.user);
  res.status(201).json({
    success: true,
    data,
    message: 'Student registered successfully. An admission fee record has been created automatically.',
  });
});

const update = asyncHandler(async (req, res) => {
  await assertCanAccessStudent(req, req.params.id);

  const patch = { ...req.body };
  if (isScopedRole(req.user.role)) {
    // A staff member can't hand a student off to a different counsellor,
    // or move them into a batch that isn't theirs — that's a reassignment
    // of responsibility, not an edit, and belongs to admin.
    if (patch.counsellorId !== undefined && patch.counsellorId !== req.user.employeeId) {
      throw ApiError.forbidden("You can't reassign this student to another counsellor.", 'NOT_ALLOWED');
    }
    if (patch.batchId) {
      const allowedBatchIds = await getStaffBatchIds(req.user.employeeId);
      if (!allowedBatchIds.includes(patch.batchId)) {
        throw ApiError.forbidden("You can only move a student into a batch assigned to you.", 'NOT_YOUR_BATCH');
      }
    }
  }

  const data = await studentService.update(req.params.id, patch);
  res.json({ success: true, data, message: 'Student updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await studentService.remove(req.params.id);
  res.json({ success: true, message: 'Student deleted successfully. Related fee, attendance, task, and performance records were also removed.' });
});

module.exports = { getAll, getAllRaw, getById, getMe, create, update, remove, assertCanAccessStudent };
