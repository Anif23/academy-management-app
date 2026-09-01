const asyncHandler = require('../utils/asyncHandler');
const employeeService = require('../services/employeeService');

const getAll = asyncHandler(async (req, res) => {
  const result = await employeeService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await employeeService.getAllRaw();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await employeeService.getById(req.params.id);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await employeeService.create(req.body);
  res.status(201).json({ success: true, data, message: 'Employee added successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const data = await employeeService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Employee updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await employeeService.remove(req.params.id);
  res.json({ success: true, message: 'Employee removed successfully.' });
});

module.exports = { getAll, getAllRaw, getById, create, update, remove };
