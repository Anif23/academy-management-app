const asyncHandler = require('../utils/asyncHandler');
const walkInService = require('../services/walkInService');

const getAll = asyncHandler(async (req, res) => {
  const result = await walkInService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await walkInService.getAllRaw();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await walkInService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await walkInService.create(req.body);
  res.status(201).json({ success: true, data, message: 'Walk-in enquiry created successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const data = await walkInService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Walk-in updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await walkInService.remove(req.params.id);
  res.json({ success: true, message: 'Walk-in deleted successfully.' });
});

module.exports = { getAll, getAllRaw, getById, create, update, remove };
