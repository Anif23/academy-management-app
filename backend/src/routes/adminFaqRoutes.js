const express = require('express');
const adminFaqController = require('../controllers/adminFaqController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('faqs:manage'));

router.get('/', adminFaqController.getAll);
router.post('/', adminFaqController.create);
router.patch('/:id', adminFaqController.update);
router.delete('/:id', adminFaqController.remove);

module.exports = router;
