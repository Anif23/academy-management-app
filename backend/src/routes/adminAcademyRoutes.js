const express = require('express');
const adminAcademyController = require('../controllers/adminAcademyController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateAcademySettingsSchema } = require('../validators/academySettingsValidators');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('academy:manage'));

router.get('/', adminAcademyController.getSettings);
router.patch('/', validate({ body: updateAcademySettingsSchema }), adminAcademyController.updateSettings);

module.exports = router;
