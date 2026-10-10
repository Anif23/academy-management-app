const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const taskService = require('../services/taskService');

const getAll = asyncHandler(async (req, res) => {
  const result = await taskService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const data = await taskService.getById(req.params.id);
  res.json({ success: true, data });
});

const getMine = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await taskService.getMine(req.user.studentId);
  res.json({ success: true, data });
});

const getMySubmission = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await taskService.getMySubmission(req.params.id, req.user.studentId);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await taskService.create(req.body, req.user);
  const message = data.assignmentType === 'batch'
    ? `Task assigned to ${data.submissionCounts.total} student(s) in the batch.`
    : 'Task assigned successfully.';
  res.status(201).json({ success: true, data, message });
});

const update = asyncHandler(async (req, res) => {
  const data = await taskService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Task updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  await taskService.remove(req.params.id);
  res.json({ success: true, message: 'Task and all related submissions deleted.' });
});

const submit = asyncHandler(async (req, res) => {
  if (!req.user.studentId) throw ApiError.notFound('No student profile linked to this account.');
  const data = await taskService.submit(req.params.id, req.user.studentId, req.body);
  res.json({ success: true, data, message: 'Task submitted successfully.' });
});

const review = asyncHandler(async (req, res) => {
  const data = await taskService.review(req.params.submissionId, req.user, req.body);
  const message = req.body.decision === 'approve' ? 'Submission approved and marked reviewed.' : 'Sent back to the student for revision.';
  res.json({ success: true, data, message });
});

const getByStudent = asyncHandler(async (req, res) => {
  const data = await taskService.getByStudent(req.params.studentId);
  res.json({ success: true, data });
});

module.exports = { getAll, getById, getMine, getMySubmission, getByStudent, create, update, remove, submit, review };
