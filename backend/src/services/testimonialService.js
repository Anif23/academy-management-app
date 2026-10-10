const prisma = require('../config/prisma');
const { cached } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

async function getActiveTestimonials() {
  return cached(CACHE_KEYS.publicTestimonials, 120, () =>
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
  );
}

module.exports = { getActiveTestimonials };
