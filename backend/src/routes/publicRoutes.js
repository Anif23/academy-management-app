const express = require('express');
const publicController = require('../controllers/publicController');
const academyController = require('../controllers/academyController');
const testimonialController = require('../controllers/testimonialController');
const faqController = require('../controllers/faqController');
const validate = require('../middleware/validateMiddleware');
const { idParamSchema } = require('../validators/commonValidators');

const router = express.Router();

// Public routes do NOT use requireAuth or requirePermission

router.get('/courses', publicController.getCourses);
router.get('/courses/:id', validate({ params: idParamSchema }), publicController.getCourseById);
router.get('/courses/:courseId/batches', publicController.getBatchesByCourse);
router.post('/register', publicController.register);

router.get('/academy', academyController.getAcademyInfo);
router.get('/testimonials', testimonialController.getTestimonials);
router.get('/faqs', faqController.getFAQs);

module.exports = router;
