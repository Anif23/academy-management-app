const express = require('express');
const adminTestimonialController = require('../controllers/adminTestimonialController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('testimonials:manage'));

router.get('/', adminTestimonialController.getAll);
router.post('/', adminTestimonialController.create);
router.patch('/:id', adminTestimonialController.update);
router.delete('/:id', adminTestimonialController.remove);

module.exports = router;
