const express = require('express');
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationQuerySchema, idParamSchema } = require('../validators/commonValidators');
const { createTaskSchema, createBatchTaskSchema, updateTaskSchema } = require('../validators/taskValidators');
const { z } = require('zod');

const router = express.Router();

router.use(requireAuth);

router.get('/me', requirePermission('tasks:read-own'), taskController.getMine);
router.get('/', requirePermission('tasks:manage'), validate({ query: paginationQuerySchema }), taskController.getAll);
router.get('/all', requirePermission('tasks:manage'), taskController.getAllRaw);
router.get(
  '/student/:studentId',
  requirePermission('tasks:manage', 'tasks:read-own'),
  validate({ params: z.object({ studentId: z.string().min(1) }) }),
  taskController.getByStudent,
);
router.post('/', requirePermission('tasks:manage'), validate({ body: createTaskSchema }), taskController.create);
router.post('/batch', requirePermission('tasks:manage'), validate({ body: createBatchTaskSchema }), taskController.createBatchTask);
router.patch('/:id', requirePermission('tasks:manage'), validate({ params: idParamSchema, body: updateTaskSchema }), taskController.update);
router.delete('/:id', requirePermission('tasks:manage'), validate({ params: idParamSchema }), taskController.remove);

module.exports = router;
