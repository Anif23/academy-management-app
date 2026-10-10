const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const courseService = require('../services/courseService');
const batchService = require('../services/batchService');
const walkInService = require('../services/walkInService');
const prisma = require('../config/prisma');
const { cached } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

/**
 * Public API Controller
 * These endpoints do NOT require authentication and are intended
 * for the public-facing Academy website.
 */

// GET /public/courses — hit on every visit to the homepage, so it's worth caching.
const getCourses = asyncHandler(async (req, res) => {
  const publicCourses = await cached(CACHE_KEYS.publicCourses, 60, async () => {
    const rows = await prisma.course.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(courseService.toPublic);
  });
  res.json({ success: true, data: publicCourses });
});

// GET /public/courses/:id
const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course || course.status !== 'ACTIVE') {
    throw ApiError.notFound('Course not found or is not currently active.');
  }

  res.json({ success: true, data: courseService.toPublic(course) });
});

// GET /public/courses/:courseId/batches
const getBatchesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const batches = await batchService.getByCourseId(courseId);

  // Only show UPCOMING or ONGOING batches to the public
  const availableBatches = batches.filter(b => b.status !== 'COMPLETED');

  res.json({ success: true, data: availableBatches });
});

// POST /public/register
const register = asyncHandler(async (req, res) => {
  const {
    name,
    mobile,
    email,
    courseInterestedId,
    batchId,
    qualification,
    location,
    remarks,
  } = req.body;

  if (!name || !mobile || !email || !courseInterestedId) {
    throw ApiError.badRequest('Missing required registration fields.');
  }

  const walkIn = await walkInService.create({
    name,
    mobile,
    email,
    courseInterestedId,
    // The batch they picked in step 3 of the registration flow — carried
    // through so staff don't have to ask again when admitting them.
    batchId: batchId || null,
    qualification: qualification || '',
    location: location || '',
    remarks: remarks || '',
    source: 'Website', // Use human-readable label as expected by enumMaps
    enquiryDate: new Date(),
    status: 'New', // Use human-readable label as expected by enumMaps
  });

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully. Our team will contact you soon!',
    data: walkIn
  });
});

// GET /public/stats — real, verified counts only (never invented numbers).
// Cached briefly: these are 4 count() queries hit by every homepage visit,
// and a minute-old count is indistinguishable to a visitor.
const getStats = asyncHandler(async (req, res) => {
  const stats = await cached(CACHE_KEYS.academyStats, 60, async () => {
    const [students, courses, trainers, batches] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count({ where: { type: 'TRAINER', status: 'ACTIVE' } }),
      prisma.batch.count({ where: { status: { in: ['UPCOMING', 'ONGOING'] } } }),
    ]);
    return { students, courses, trainers, batches };
  });

  res.json({ success: true, data: stats });
});

module.exports = {
  getCourses,
  getCourseById,
  getBatchesByCourse,
  register,
  getStats,
};
