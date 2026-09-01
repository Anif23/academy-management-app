const express = require('express');
const employeeController = require('../controllers/employeeController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validators/employeeValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission('staff:manage'), validate({ query: paginationQuerySchema }), employeeController.getAll);
router.get('/all', requirePermission('staff:manage', 'batches:manage', 'batches:read', 'classreports:manage'), employeeController.getAllRaw);
router.get('/:id', requirePermission('staff:manage'), validate({ params: idParamSchema }), employeeController.getById);
router.post('/', requirePermission('staff:manage'), validate({ body: createEmployeeSchema }), employeeController.create);
router.patch('/:id', requirePermission('staff:manage'), validate({ params: idParamSchema, body: updateEmployeeSchema }), employeeController.update);
router.delete('/:id', requirePermission('staff:manage'), validate({ params: idParamSchema }), employeeController.remove);

module.exports = router;
