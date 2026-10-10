const express = require('express');
const adminAnnouncementController = require('../controllers/adminAnnouncementController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { idParamSchema } = require('../validators/commonValidators');
const { createAnnouncementSchema, updateAnnouncementSchema } = require('../validators/announcementValidators');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('announcements:manage'));

router.get('/', adminAnnouncementController.getAll);
router.post('/', validate({ body: createAnnouncementSchema }), adminAnnouncementController.create);
router.patch('/:id', validate({ params: idParamSchema, body: updateAnnouncementSchema }), adminAnnouncementController.update);
router.delete('/:id', validate({ params: idParamSchema }), adminAnnouncementController.remove);

module.exports = router;
