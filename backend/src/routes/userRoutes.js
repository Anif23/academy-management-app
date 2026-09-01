const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createUserSchema, updateUserSchema } = require('../validators/userValidators');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('users:read'));

router.get('/', validate({ query: paginationQuerySchema }), userController.getAll);
router.get('/:id', validate({ params: idParamSchema }), userController.getById);
router.post('/', requirePermission('users:create'), validate({ body: createUserSchema }), userController.create);
router.patch('/:id', requirePermission('users:update'), validate({ params: idParamSchema, body: updateUserSchema }), userController.update);
router.delete('/:id', requirePermission('users:delete'), validate({ params: idParamSchema }), userController.remove);

module.exports = router;
