const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const dashboardService = require('../services/dashboardService');

const getStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStats();
  res.json({ success: true, data });
});

const getRevenueSeries = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenueSeries();
  res.json({ success: true, data });
});

const getCourseDistribution = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCourseDistribution();
  res.json({ success: true, data });
});

const getLeadFunnel = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLeadFunnel();
  res.json({ success: true, data });
});

const getStudentStats = asyncHandler(async (req, res) => {
  if (req.user.role === 'STUDENT' && req.user.studentId !== req.params.studentId) {
    throw ApiError.forbidden("You can't access another student's dashboard.", 'IDOR_BLOCKED');
  }
  const data = await dashboardService.getStudentDashboardStats(req.params.studentId);
  if (!data) throw ApiError.notFound('Student not found.');
  res.json({ success: true, data });
});

const getMyStats = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await dashboardService.getStudentDashboardStats(req.user.studentId);
  res.json({ success: true, data });
});

module.exports = { getStats, getRevenueSeries, getCourseDistribution, getLeadFunnel, getStudentStats, getMyStats };
