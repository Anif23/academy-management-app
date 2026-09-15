const express = require('express');
const adminAcademyController = require('../controllers/adminAcademyController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('academy:manage'));

router.get('/', adminAcademyController.getSettings);
router.patch('/', adminAcademyController.updateSettings);

module.exports = router;
