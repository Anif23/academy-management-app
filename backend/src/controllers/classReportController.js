const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const classReportService = require('../services/classReportService');
const { staffOwnsBatch } = require('../utils/staffScope');
const { isScopedRole } = require('../constants/roles');

const getAll = asyncHandler(async (req, res) => {
  const result = await classReportService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await classReportService.getAllRaw();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await classReportService.getById(req.params.id);
  if (isScopedRole(req.user.role) && !(await staffOwnsBatch(req.user.employeeId, data.batchId))) {
    throw ApiError.forbidden("You're not assigned to this batch.", 'NOT_YOUR_BATCH');
  }
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  if (isScopedRole(req.user.role) && !(await staffOwnsBatch(req.user.employeeId, req.body.batchId))) {
    throw ApiError.forbidden("You can only report on batches assigned to you.", 'NOT_YOUR_BATCH');
  }
  const data = await classReportService.create(req.body, req.user);
  res.status(201).json({ success: true, data, message: 'Class report submitted successfully.' });
});

const update = asyncHandler(async (req, res) => {
  if (isScopedRole(req.user.role)) {
    const existing = await classReportService.getById(req.params.id);
    if (!(await staffOwnsBatch(req.user.employeeId, existing.batchId))) {
      throw ApiError.forbidden("You're not assigned to this batch.", 'NOT_YOUR_BATCH');
    }
  }
  const data = await classReportService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Class report updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  if (isScopedRole(req.user.role)) {
    const existing = await classReportService.getById(req.params.id);
    if (!(await staffOwnsBatch(req.user.employeeId, existing.batchId))) {
      throw ApiError.forbidden("You're not assigned to this batch.", 'NOT_YOUR_BATCH');
    }
  }
  await classReportService.remove(req.params.id);
  res.json({ success: true, message: 'Class report deleted successfully.' });
});

module.exports = { getAll, getAllRaw, getById, create, update, remove };
