const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const batchService = require('../services/batchService');
const { staffOwnsBatch } = require('../utils/staffScope');

const getAll = asyncHandler(async (req, res) => {
  const result = await batchService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await batchService.getAllRaw(req.user);
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  if (req.user.role === 'STAFF' && !(await staffOwnsBatch(req.user.employeeId, req.params.id))) {
    throw ApiError.forbidden("You're not assigned to this batch.", 'NOT_YOUR_BATCH');
  }
  const data = await batchService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await batchService.create(req.body);
  res.status(201).json({ success: true, data, message: 'Batch created successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const data = await batchService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Batch updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await batchService.remove(req.params.id);
  res.json({ success: true, message: 'Batch deleted successfully.' });
});

module.exports = { getAll, getAllRaw, getById, create, update, remove };
