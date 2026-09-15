const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const courseService = require('../services/courseService');
const batchService = require('../services/batchService');
const walkInService = require('../services/walkInService');
const prisma = require('../config/prisma');

/**
 * Public API Controller
 * These endpoints do NOT require authentication and are intended
 * for the public-facing Academy website.
 */

// GET /public/courses
const getCourses = asyncHandler(async (req, res) => {
  // Only return ACTIVE courses to the public
  const rows = await prisma.course.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  const publicCourses = rows.map(courseService.toPublic);
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

// GET /public/academy
const getAcademyInfo = asyncHandler(async (req, res) => {
  // Currently serving static info. If a settings table is added later,
  // this can be converted to a DB call.
  res.json({
    success: true,
    data: {
      name: 'Academy Pro',
      description: 'A premium center for learning modern technology and practical skills.',
      mission: 'To empower students with industry-ready skills through practical training.',
      vision: 'To be the leading hub for technical education and career growth.',
      contact: {
        phone: '+91 9876543210',
        email: 'info@academypro.com',
        address: '123 Education Lane, Tech City, India',
        whatsapp: '+91 9876543210',
      },
      workingHours: 'Mon - Sat: 9 AM - 7 PM',
    }
  });
});

module.exports = {
  getCourses,
  getCourseById,
  getBatchesByCourse,
  register,
  getAcademyInfo,
};
