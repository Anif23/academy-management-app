const asyncHandler = require('../utils/asyncHandler');
const announcementService = require('../services/announcementService');

const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getActiveAnnouncements();
  res.json({ success: true, data: announcements });
});

module.exports = { getAnnouncements };
