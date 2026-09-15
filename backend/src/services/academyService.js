const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function getSettings() {
  const settings = await prisma.academySettings.findUnique({
    where: { id: 'singleton' },
  });
  if (!settings) throw ApiError.notFound('Academy settings not found. Please configure them in the admin panel.');
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
  return settings;
}

module.exports = { getSettings, updateSettings };
