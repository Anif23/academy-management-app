const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const attendanceService = require('../services/attendanceService');

const getByStudent = asyncHandler(async (req, res) => {
  if (req.user.role === 'STUDENT' && req.user.studentId !== req.params.studentId) {
    throw ApiError.forbidden("You can't access another student's attendance.", 'IDOR_BLOCKED');
  }
  const data = await attendanceService.getByStudent(req.params.studentId);
  res.json({ success: true, data });
});

const getMine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await attendanceService.getByStudent(req.user.studentId);
  res.json({ success: true, data });
});

const getByBatchAndDate = asyncHandler(async (req, res) => {
  const { batchId, date } = req.query;
  if (!batchId || !date) throw ApiError.badRequest('batchId and date query params are required.');
  const data = await attendanceService.getByBatchAndDate(batchId, new Date(date));
  res.json({ success: true, data });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await attendanceService.getAllRaw();
  res.json({ success: true, data });
});

const markBulk = asyncHandler(async (req, res) => {
  const { batchId, date, marks } = req.body;
  const data = await attendanceService.markBulk(batchId, date, marks);
  res.json({ success: true, data, message: 'Attendance saved successfully.' });
});

const getClassSummary = asyncHandler(async (req, res) => {
  const { batchId, date } = req.query;
  if (!batchId || !date) throw ApiError.badRequest('batchId and date query params are required.');
  const data = await attendanceService.computeClassAttendance(batchId, new Date(date));
  res.json({ success: true, data });
});

module.exports = { getByStudent, getMine, getByBatchAndDate, getAllRaw, markBulk, getClassSummary };
