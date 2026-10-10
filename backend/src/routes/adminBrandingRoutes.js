const express = require('express');
const brandingController = require('../controllers/brandingController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateBrandingSchema } = require('../validators/brandingValidators');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('branding:manage'));

router.patch('/', validate({ body: updateBrandingSchema }), brandingController.updateBranding);

module.exports = router;
