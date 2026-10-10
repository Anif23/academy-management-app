const asyncHandler = require('../utils/asyncHandler');
const announcementService = require('../services/adminAnnouncementService');

const getAll = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAll();
  res.json({ success: true, data: announcements });
});

const create = asyncHandler(async (req, res) => {
  const announcement = await announcementService.create(req.body);
  res.status(201).json({ success: true, data: announcement });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await announcementService.update(id, req.body);
  res.json({ success: true, data: announcement });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await announcementService.remove(id);
  res.json({ success: true, message: 'Announcement removed successfully' });
});

module.exports = { getAll, create, update, remove };
