const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { cached } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

async function getSettings() {
  // Public academy info is read on every visit to the marketing site and
  // barely ever changes — cache it briefly instead of hitting Postgres for
  // every visitor (matters once traffic is more than a handful of requests/sec).
  const settings = await cached(CACHE_KEYS.academySettings, 120, () =>
    prisma.academySettings.findUnique({ where: { id: 'singleton' } }),
  );
  if (!settings) throw ApiError.notFound('Academy settings not found. Please configure them in the admin panel.');
  return settings;
}

module.exports = { getSettings };
