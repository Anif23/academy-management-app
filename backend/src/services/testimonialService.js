const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function getActiveTestimonials() {
  return await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function create(input) {
  const testimonial = await prisma.testimonial.create({
    data: input,
  });
  return testimonial;
}

module.exports = { getActiveTestimonials, create };
