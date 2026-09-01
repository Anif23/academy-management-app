const express = require('express');
const courseController = require('../controllers/courseController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createCourseSchema, updateCourseSchema } = require('../validators/courseValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/', requirePermission('courses:manage', 'courses:read'), validate({ query: paginationQuerySchema }), courseController.getAll);
router.get('/all', requirePermission('courses:manage', 'courses:read', 'courses:read-own'), courseController.getAllRaw);
router.get('/:id', requirePermission('courses:manage', 'courses:read'), validate({ params: idParamSchema }), courseController.getById);
router.post('/', requirePermission('courses:manage'), validate({ body: createCourseSchema }), courseController.create);
router.patch('/:id', requirePermission('courses:manage'), validate({ params: idParamSchema, body: updateCourseSchema }), courseController.update);
router.delete('/:id', requirePermission('courses:manage'), validate({ params: idParamSchema }), courseController.remove);

module.exports = router;
