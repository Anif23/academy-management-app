const express = require('express');
const employeeController = require('../controllers/employeeController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validators/employeeValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission('staff:read'), validate({ query: paginationQuerySchema }), employeeController.getAll);
router.get('/all', requirePermission('staff:read', 'batches:read', 'batches:create', 'batches:update', 'classreports:read', 'walkins:read', 'walkins:create', 'students:create', 'students:update'), employeeController.getAllRaw);
router.get('/:id', requirePermission('staff:read'), validate({ params: idParamSchema }), employeeController.getById);
router.post('/', requirePermission('staff:create'), validate({ body: createEmployeeSchema }), employeeController.create);
router.patch('/:id', requirePermission('staff:update'), validate({ params: idParamSchema, body: updateEmployeeSchema }), employeeController.update);
router.delete('/:id', requirePermission('staff:delete'), validate({ params: idParamSchema }), employeeController.remove);

module.exports = router;
