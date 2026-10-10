const express = require('express');
const classReportController = require('../controllers/classReportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createClassReportSchema, updateClassReportSchema } = require('../validators/classReportValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission('classreports:read'), validate({ query: paginationQuerySchema }), classReportController.getAll);
router.get('/all', requirePermission('classreports:read'), classReportController.getAllRaw);
router.get('/:id', requirePermission('classreports:read'), validate({ params: idParamSchema }), classReportController.getById);
router.post('/', requirePermission('classreports:create'), validate({ body: createClassReportSchema }), classReportController.create);
router.patch('/:id', requirePermission('classreports:update'), validate({ params: idParamSchema, body: updateClassReportSchema }), classReportController.update);
router.delete('/:id', requirePermission('classreports:delete'), validate({ params: idParamSchema }), classReportController.remove);

module.exports = router;
