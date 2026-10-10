const express = require('express');
const walkInController = require('../controllers/walkInController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createWalkInSchema, updateWalkInSchema } = require('../validators/walkInValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission('walkins:read'), validate({ query: paginationQuerySchema }), walkInController.getAll);
router.get('/all', requirePermission('walkins:read'), walkInController.getAllRaw);
router.get('/:id', requirePermission('walkins:read'), validate({ params: idParamSchema }), walkInController.getById);
router.post('/', requirePermission('walkins:create'), validate({ body: createWalkInSchema }), walkInController.create);
router.patch('/:id', requirePermission('walkins:update'), validate({ params: idParamSchema, body: updateWalkInSchema }), walkInController.update);
router.delete('/:id', requirePermission('walkins:delete'), validate({ params: idParamSchema }), walkInController.remove);

module.exports = router;
