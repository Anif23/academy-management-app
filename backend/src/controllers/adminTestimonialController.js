const asyncHandler = require('../utils/asyncHandler');
const testimonialService = require('../services/adminTestimonialService');

const getAll = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAll();
  res.json({ success: true, data: testimonials });
});

const create = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.create(req.body);
  res.status(201).json({ success: true, data: testimonial });
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const testimonial = await testimonialService.update(id, req.body);
  res.json({ success: true, data: testimonial });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await testimonialService.remove(id);
  res.json({ success: true, message: 'Testimonial removed successfully' });
});

module.exports = {
  getAll,
  create,
  update,
  remove,
};
