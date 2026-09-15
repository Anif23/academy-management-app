const asyncHandler = require('../utils/asyncHandler');
const adminAcademyService = require('../services/adminAcademyService');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await adminAcademyService.getSettings();
  res.json({ success: true, data: settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await adminAcademyService.updateSettings(req.body);
  res.json({ success: true, data: settings });
});

module.exports = {
  getSettings,
  updateSettings,
};
