const asyncHandler = require('../utils/asyncHandler');
const brandingService = require('../services/brandingService');

// Public — the login screen (pre-authentication) needs the app name/logo
// too, so this can't sit behind requireAuth.
const getBranding = asyncHandler(async (req, res) => {
  const data = await brandingService.getBranding();
  res.json({ success: true, data });
});

const updateBranding = asyncHandler(async (req, res) => {
  const data = await brandingService.updateBranding(req.body);
  res.json({ success: true, data, message: 'Branding updated successfully.' });
});

module.exports = { getBranding, updateBranding };
