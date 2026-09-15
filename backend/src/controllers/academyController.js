const asyncHandler = require('../utils/asyncHandler');
const academyService = require('../services/academyService');

const getAcademyInfo = asyncHandler(async (req, res) => {
  const settings = await academyService.getSettings();
  res.json({ success: true, data: settings });
});

module.exports = {
  getAcademyInfo,
};
