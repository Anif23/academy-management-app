const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { invalidate } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

async function getSettings() {
  const settings = await prisma.academySettings.findUnique({
    where: { id: 'singleton' },
  });
  if (!settings) throw ApiError.notFound('Academy settings not found.');
  return settings;
}

async function updateSettings(data) {
  const settings = await prisma.academySettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: {
      id: 'singleton',
      ...data,
    },
  });
  // The public site would otherwise keep serving the old name/logo/legal
  // details for up to the cache's TTL after a save.
  await invalidate(CACHE_KEYS.academySettings);
  return settings;
}

module.exports = { getSettings, updateSettings };
