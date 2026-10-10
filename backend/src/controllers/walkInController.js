const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const walkInService = require('../services/walkInService');
const { isScopedRole } = require('../constants/roles');

function assertOwnsLead(req, walkIn) {
  if (isScopedRole(req.user.role) && walkIn.counsellorId !== req.user.employeeId) {
    throw ApiError.forbidden('This lead is not assigned to you.', 'NOT_YOUR_LEAD');
  }
}

const getAll = asyncHandler(async (req, res) => {
  const result = await walkInService.getAll(req.query, req.user);
  res.json({ success: true, ...result });
});

const getAllRaw = asyncHandler(async (req, res) => {
  const data = await walkInService.getAllRaw();
  res.json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await walkInService.getById(req.params.id);
  assertOwnsLead(req, data);
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  // A counsellor creating a lead directly is assigning it to themselves,
  // not whoever the client happens to send in the payload.
  const input = isScopedRole(req.user.role) ? { ...req.body, counsellorId: req.user.employeeId } : req.body;
  const data = await walkInService.create(input);
  res.status(201).json({ success: true, data, message: 'Walk-in enquiry created successfully.' });
});

const update = asyncHandler(async (req, res) => {
  if (isScopedRole(req.user.role)) {
    const existing = await walkInService.getById(req.params.id);
    assertOwnsLead(req, existing);
  }
  const data = await walkInService.update(req.params.id, req.body);
  res.json({ success: true, data, message: 'Walk-in updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  if (isScopedRole(req.user.role)) {
    const existing = await walkInService.getById(req.params.id);
    assertOwnsLead(req, existing);
  }
  await walkInService.remove(req.params.id);
  res.json({ success: true, message: 'Walk-in deleted successfully.' });
});

module.exports = { getAll, getAllRaw, getById, create, update, remove };
