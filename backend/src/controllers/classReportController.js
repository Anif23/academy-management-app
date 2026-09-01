const asyncHandler = require('../utils/asyncHandler');
const classReportService = require('../services/classReportService');

const getAll = asyncHandler(async (req, res) => {
  const result = await classReportService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await classReportService.getAllRaw();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await classReportService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await classReportService.create(req.body);
  res.status(201).json({ success: true, data, message: 'Class report submitted successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const data = await classReportService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Class report updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await classReportService.remove(req.params.id);
  res.json({ success: true, message: 'Class report deleted successfully.' });
});

module.exports = { getAll, getAllRaw, getById, create, update, remove };
