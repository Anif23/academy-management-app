const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const studentRoutes = require('./studentRoutes');
const employeeRoutes = require('./employeeRoutes');
const courseRoutes = require('./courseRoutes');
const batchRoutes = require('./batchRoutes');
const walkInRoutes = require('./walkInRoutes');
const feeRoutes = require('./feeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const taskRoutes = require('./taskRoutes');
const performanceRoutes = require('./performanceRoutes');
const classReportRoutes = require('./classReportRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const searchRoutes = require('./searchRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/employees', employeeRoutes);
router.use('/courses', courseRoutes);
router.use('/batches', batchRoutes);
router.use('/walkins', walkInRoutes);
router.use('/fees', feeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/tasks', taskRoutes);
router.use('/performance', performanceRoutes);
router.use('/class-reports', classReportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);

module.exports = router;
