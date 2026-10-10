const prisma = require('../config/prisma');
const { cached } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

/** Public feed: active, inside its optional date window, ordered for display. */
async function getActiveAnnouncements() {
  // Shorter TTL than testimonials/FAQs — an announcement's start/end window
  // means "active" can flip on its own even without an admin edit.
  return cached(CACHE_KEYS.publicAnnouncements, 30, () => {
    const now = new Date();
    return prisma.announcement.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  });
}

module.exports = { getActiveAnnouncements };
