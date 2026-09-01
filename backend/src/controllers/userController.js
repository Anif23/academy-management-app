const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

const getAll = asyncHandler(async (req, res) => {
  const result = await userService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const data = await userService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await userService.create(req.body);
  res.status(201).json({ success: true, data, message: 'User account created successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const data = await userService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'User updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id);
  res.json({ success: true, message: 'User deleted successfully.' });
});

module.exports = { getAll, getById, create, update, remove };
