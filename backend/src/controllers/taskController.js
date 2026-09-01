const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const taskService = require('../services/taskService');

const getAll = asyncHandler(async (req, res) => {
  const result = await taskService.getAll(req.query);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await taskService.getAllRaw();
  res.json({ success: true, data });
});

const getByStudent = asyncHandler(async (req, res) => {
  if (req.user.role === 'STUDENT' && req.user.studentId !== req.params.studentId) {
    throw ApiError.forbidden("You can't access another student's tasks.", 'IDOR_BLOCKED');
  }
  const data = await taskService.getByStudent(req.params.studentId);
  res.json({ success: true, data });
});

const getMine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await taskService.getByStudent(req.user.studentId);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await taskService.create(req.body);
  res.status(201).json({ success: true, data, message: 'Task assigned successfully.' });
});

const createBatchTask = asyncHandler(async (req, res) => {
  const data = await taskService.createBatchTask(req.body);
  res.status(201).json({ success: true, data, message: `Task assigned to ${data.length} student(s) in the batch.` });
});

const update = asyncHandler(async (req, res) => {
  const data = await taskService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Task updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await taskService.remove(req.params.id);
  res.json({ success: true, message: 'Task deleted successfully.' });
});

module.exports = { getAll, getAllRaw, getByStudent, getMine, create, createBatchTask, update, remove };
