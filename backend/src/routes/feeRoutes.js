const express = require('express');
const feeController = require('../controllers/feeController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { idParamSchema } = require('../validators/commonValidators');
const { updateFeeSchema, addPaymentSchema } = require('../validators/feeValidators');
const { z } = require('zod');

const router = express.Router();

router.use(requireAuth);

router.get('/me', requirePermission('fees:read-own'), feeController.getMine);
router.get('/all', requirePermission('fees:read'), feeController.getAllRaw);
router.get(
  '/student/:studentId',
  requirePermission('fees:read', 'fees:read-own'),
  validate({ params: z.object({ studentId: z.string().min(1) }) }),
  feeController.getByStudent,
);
router.patch('/:id', requirePermission('fees:update'), validate({ params: idParamSchema, body: updateFeeSchema }), feeController.update);
router.post(
  '/:id/payments',
  requirePermission('fees:create'),
  validate({ params: idParamSchema, body: addPaymentSchema }),
  feeController.addPayment,
);

module.exports = router;
