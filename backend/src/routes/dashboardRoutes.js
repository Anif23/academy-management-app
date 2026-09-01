const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { z } = require('zod');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/stats', requirePermission('dashboard:read'), dashboardController.getStats);
router.get('/revenue-series', requirePermission('dashboard:read'), dashboardController.getRevenueSeries);
router.get('/course-distribution', requirePermission('dashboard:read'), dashboardController.getCourseDistribution);
router.get('/lead-funnel', requirePermission('dashboard:read'), dashboardController.getLeadFunnel);
router.get('/student/me', requirePermission('profile:read-own'), dashboardController.getMyStats);
router.get(
  '/student/:studentId',
  requirePermission('dashboard:read', 'profile:read-own'),
  validate({ params: z.object({ studentId: z.string().min(1) }) }),
  dashboardController.getStudentStats,
);

module.exports = router;
