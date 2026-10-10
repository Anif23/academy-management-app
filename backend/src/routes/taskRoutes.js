const express = require('express');
const { z } = require('zod');
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const {
  createTaskSchema,
  updateTaskSchema,
  submitTaskSchema,
  reviewSubmissionSchema,
} = require('../validators/taskValidators');

const router = express.Router();

router.use(requireAuth);

// Student's own view.
router.get('/me', requirePermission('tasks:read-own'), taskController.getMine);
router.get('/me/:id', requirePermission('tasks:read-own'), validate({ params: idParamSchema }), taskController.getMySubmission);
router.post(
  '/me/:id/submit',
  requirePermission('tasks:read-own'),
  validate({ params: idParamSchema, body: submitTaskSchema }),
  taskController.submit,
);

// Admin/Staff task management (role-scoped inside taskService for STAFF).
router.get('/', requirePermission('tasks:read'), validate({ query: paginationQuerySchema }), taskController.getAll);
router.get(
  '/by-student/:studentId',
  requirePermission('tasks:read'),
  validate({ params: z.object({ studentId: z.string().min(1) }) }),
  taskController.getByStudent,
);
router.get('/:id', requirePermission('tasks:read'), validate({ params: idParamSchema }), taskController.getById);
router.post('/', requirePermission('tasks:create'), validate({ body: createTaskSchema }), taskController.create);
router.patch('/:id', requirePermission('tasks:update'), validate({ params: idParamSchema, body: updateTaskSchema }), taskController.update);
router.delete('/:id', requirePermission('tasks:delete'), validate({ params: idParamSchema }), taskController.remove);

// Trainer review action on a specific student's submission.
router.post(
  '/submissions/:submissionId/review',
  requirePermission('tasks:update'),
  validate({ params: z.object({ submissionId: z.string().min(1) }), body: reviewSubmissionSchema }),
  taskController.review,
);

module.exports = router;
