const express = require('express');
const classReportController = require('../controllers/classReportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createClassReportSchema, updateClassReportSchema } = require('../validators/classReportValidators');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('classreports:manage'));

router.get('/', validate({ query: paginationQuerySchema }), classReportController.getAll);
router.get('/all', classReportController.getAllRaw);
router.get('/:id', validate({ params: idParamSchema }), classReportController.getById);
router.post('/', validate({ body: createClassReportSchema }), classReportController.create);
router.patch('/:id', validate({ params: idParamSchema, body: updateClassReportSchema }), classReportController.update);
router.delete('/:id', validate({ params: idParamSchema }), classReportController.remove);

module.exports = router;
