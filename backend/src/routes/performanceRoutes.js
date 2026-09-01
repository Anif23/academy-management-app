const express = require('express');
const performanceController = require('../controllers/performanceController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { idParamSchema } = require('../validators/commonValidators');
const { createPerformanceSchema, updatePerformanceSchema } = require('../validators/performanceValidators');
const { z } = require('zod');

const router = express.Router();

router.use(requireAuth);

router.get('/me', requirePermission('performance:read-own'), performanceController.getMine);
router.get('/all', requirePermission('performance:manage'), performanceController.getAllRaw);
router.get(
  '/student/:studentId',
  requirePermission('performance:manage', 'performance:read-own'),
  validate({ params: z.object({ studentId: z.string().min(1) }) }),
  performanceController.getByStudent,
);
router.post('/', requirePermission('performance:manage'), validate({ body: createPerformanceSchema }), performanceController.create);
router.patch(
  '/:id',
  requirePermission('performance:manage'),
  validate({ params: idParamSchema, body: updatePerformanceSchema }),
  performanceController.update,
);
router.delete('/:id', requirePermission('performance:manage'), validate({ params: idParamSchema }), performanceController.remove);

module.exports = router;
