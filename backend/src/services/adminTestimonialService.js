const prisma = require('../config/prisma');
const { invalidate } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

async function getAll() {
  return prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
}

async function create(data) {
  const testimonial = await prisma.testimonial.create({ data });
  await invalidate(CACHE_KEYS.publicTestimonials);
  return testimonial;
}

async function update(id, data) {
  const testimonial = await prisma.testimonial.update({ where: { id }, data });
  await invalidate(CACHE_KEYS.publicTestimonials);
  return testimonial;
}

async function remove(id) {
  await prisma.testimonial.delete({ where: { id } });
  await invalidate(CACHE_KEYS.publicTestimonials);
}

module.exports = { getAll, create, update, remove };
