const asyncHandler = require('../utils/asyncHandler');
const courseService = require('../services/courseService');

const getAll = asyncHandler(async (req, res) => {
  const result = await courseService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await courseService.getAllRaw();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await courseService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await courseService.create(req.body);
  res.status(201).json({ success: true, data, message: 'Course created successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const data = await courseService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Course updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await courseService.remove(req.params.id);
  res.json({ success: true, message: 'Course deleted successfully.' });
});

module.exports = { getAll, getAllRaw, getById, create, update, remove };
