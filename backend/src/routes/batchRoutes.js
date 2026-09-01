const express = require('express');
const batchController = require('../controllers/batchController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createBatchSchema, updateBatchSchema } = require('../validators/batchValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission('batches:manage', 'batches:read'), validate({ query: paginationQuerySchema }), batchController.getAll);
router.get('/all', requirePermission('batches:manage', 'batches:read', 'students:read', 'tasks:manage'), batchController.getAllRaw);
router.get('/:id', requirePermission('batches:manage', 'batches:read'), validate({ params: idParamSchema }), batchController.getById);
router.post('/', requirePermission('batches:manage'), validate({ body: createBatchSchema }), batchController.create);
router.patch('/:id', requirePermission('batches:manage'), validate({ params: idParamSchema, body: updateBatchSchema }), batchController.update);
router.delete('/:id', requirePermission('batches:manage'), validate({ params: idParamSchema }), batchController.remove);

module.exports = router;
