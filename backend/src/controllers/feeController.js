const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const feeService = require('../services/feeService');

async function assertCanAccessFeeForStudent(req, studentId) {
  if (req.user.role === 'STUDENT' && req.user.studentId !== studentId) {
    throw ApiError.forbidden("You can't access another student's fee data.", 'IDOR_BLOCKED');
  }
}

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await feeService.getAllRaw();
  res.json({ success: true, data });
});

const getByStudent = asyncHandler(async (req, res) => {
  await assertCanAccessFeeForStudent(req, req.params.studentId);
  const data = await feeService.getByStudentId(req.params.studentId);
  res.json({ success: true, data });
});

const getMine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await feeService.getByStudentId(req.user.studentId);
  res.json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await feeService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Fee details updated successfully.' });
});

const addPayment = asyncHandler(async (req, res) => {
  const data = await feeService.addPayment(req.params.id, req.body);
  res.status(201).json({ success: true, data, message: 'Payment recorded successfully.' });
});

module.exports = { getAllRaw, getByStudent, getMine, update, addPayment };
