const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const performanceService = require('../services/performanceService');
const { staffOwnsStudent } = require('../utils/staffScope');
const { isScopedRole } = require('../constants/roles');

async function assertCanTouchStudent(req, studentId) {
  if (isScopedRole(req.user.role) && !(await staffOwnsStudent(req.user.employeeId, studentId))) {
    throw ApiError.forbidden('This student is not in one of your assigned batches.', 'NOT_YOUR_STUDENT');
  }
}

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await performanceService.getAllRaw(req.user);
  res.json({ success: true, data });
});

const getByStudent = asyncHandler(async (req, res) => {
  if (req.user.role === 'STUDENT' && req.user.studentId !== req.params.studentId) {
    throw ApiError.forbidden("You can't access another student's performance records.", 'IDOR_BLOCKED');
  }
  await assertCanTouchStudent(req, req.params.studentId);
  const data = await performanceService.getByStudent(req.params.studentId);
  res.json({ success: true, data });
});

const getMine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await performanceService.getByStudent(req.user.studentId);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  await assertCanTouchStudent(req, req.body.studentId);
  const data = await performanceService.create(req.body);
  res.status(201).json({ success: true, data, message: 'Performance record saved successfully.' });
});

const update = asyncHandler(async (req, res) => {
  if (isScopedRole(req.user.role)) {
    const existing = await performanceService.getById(req.params.id);
    await assertCanTouchStudent(req, existing.studentId);
  }
  const data = await performanceService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Performance record updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  if (isScopedRole(req.user.role)) {
    const existing = await performanceService.getById(req.params.id);
    await assertCanTouchStudent(req, existing.studentId);
  }
  await performanceService.remove(req.params.id);
  res.json({ success: true, message: 'Performance record deleted successfully.' });
});

module.exports = { getAllRaw, getByStudent, getMine, create, update, remove };
