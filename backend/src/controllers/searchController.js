const asyncHandler = require('../utils/asyncHandler');
const searchService = require('../services/searchService');

const search = asyncHandler(async (req, res) => {
  const data = await searchService.globalSearch(req.query.q);
  res.json({ success: true, data });
});

module.exports = { search };
