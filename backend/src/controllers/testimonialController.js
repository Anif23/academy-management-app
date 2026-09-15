const asyncHandler = require('../utils/asyncHandler');
const testimonialService = require('../services/testimonialService');

const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getActiveTestimonials();
  res.json({ success: true, data: testimonials });
});

module.exports = {
  getTestimonials,
};
