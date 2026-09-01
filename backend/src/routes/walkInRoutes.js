const express = require('express');
const walkInController = require('../controllers/walkInController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createWalkInSchema, updateWalkInSchema } = require('../validators/walkInValidators');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('walkins:manage'));

router.get('/', validate({ query: paginationQuerySchema }), walkInController.getAll);
router.get('/all', walkInController.getAllRaw);
router.get('/:id', validate({ params: idParamSchema }), walkInController.getById);
router.post('/', validate({ body: createWalkInSchema }), walkInController.create);
router.patch('/:id', validate({ params: idParamSchema, body: updateWalkInSchema }), walkInController.update);
router.delete('/:id', validate({ params: idParamSchema }), walkInController.remove);

module.exports = router;
