const express = require('express');
const studentController = require('../controllers/studentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createStudentSchema, updateStudentSchema } = require('../validators/studentValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/me', requirePermission('profile:read-own'), studentController.getMe);
router.get('/', requirePermission('students:read'), validate({ query: paginationQuerySchema }), studentController.getAll);
router.get('/all', requirePermission('students:read'), studentController.getAllRaw);
router.get(
  '/:id',
  requirePermission('students:read', 'profile:read-own'),
  validate({ params: idParamSchema }),
  studentController.getById,
);
router.post('/', requirePermission('students:create'), validate({ body: createStudentSchema }), studentController.create);
router.patch(
  '/:id',
  requirePermission('students:update'),
  validate({ params: idParamSchema, body: updateStudentSchema }),
  studentController.update,
);
router.delete('/:id', requirePermission('students:delete'), validate({ params: idParamSchema }), studentController.remove);

module.exports = router;
