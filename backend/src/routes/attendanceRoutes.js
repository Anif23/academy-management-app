const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const validate = require('../middleware/validateMiddleware');
const { markBulkAttendanceSchema } = require('../validators/attendanceValidators');

const router = express.Router();

router.use(requireAuth);

router.get('/me', requirePermission('attendance:read-own'), attendanceController.getMine);
router.get('/all', requirePermission('attendance:read'), attendanceController.getAllRaw);
router.get('/by-batch-date', requirePermission('attendance:read'), attendanceController.getByBatchAndDate);
router.get('/class-summary', requirePermission('attendance:read', 'classreports:read'), attendanceController.getClassSummary);
router.get(
  '/student/:studentId',
  requirePermission('attendance:read', 'attendance:read-own'),
  attendanceController.getByStudent,
);
router.post(
  '/mark',
  requirePermission('attendance:create', 'attendance:update'),
  validate({ body: markBulkAttendanceSchema }),
  attendanceController.markBulk,
);

module.exports = router;
