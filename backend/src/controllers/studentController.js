const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const studentService = require('../services/studentService');

/**
 * A STUDENT caller may only ever see their own record — enforced here by
 * comparing the requested id against req.user.studentId, never by trusting
 * the client to only ask for its own data. Admin/staff pass straight
 * through, already gated by requirePermission in the route.
 */
function assertCanAccessStudent(req, studentId) {
  if (req.user.role === 'STUDENT' && req.user.studentId !== studentId) {
    throw ApiError.forbidden("You can't access another student's data.", 'IDOR_BLOCKED');
  }
}

const getAll = asyncHandler(async (req, res) => {
  const result = await studentService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await studentService.getAllRaw();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  assertCanAccessStudent(req, req.params.id);
  const data = await studentService.getById(req.params.id);
  res.json({ success: true, data });
});

const getMe = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await studentService.getById(req.user.studentId);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await studentService.create(req.body);
  res.status(201).json({
    success: true,
    data,
    message: 'Student registered successfully. An admission fee record has been created automatically.',
  });
});

const update = asyncHandler(async (req, res) => {
  const data = await studentService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Student updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await studentService.remove(req.params.id);
  res.json({ success: true, message: 'Student deleted successfully. Related fee, attendance, task, and performance records were also removed.' });
});

module.exports = { getAll, getAllRaw, getById, getMe, create, update, remove, assertCanAccessStudent };
