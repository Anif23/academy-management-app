const express = require('express');
const permissionsController = require('../controllers/permissionsController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updatePermissionSchema } = require('../validators/permissionsValidators');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('permissions:manage'));

router.get('/', permissionsController.getMatrix);
router.patch('/', validate({ body: updatePermissionSchema }), permissionsController.update);

module.exports = router;
