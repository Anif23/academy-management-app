const prisma = require('../config/prisma');
const { cached } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

async function getActiveFAQs() {
  return cached(CACHE_KEYS.publicFaqs, 120, () =>
    prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  );
}

module.exports = { getActiveFAQs };
