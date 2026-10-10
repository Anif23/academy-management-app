const prisma = require('../config/prisma');
const { invalidate } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

async function getAll() {
  return prisma.announcement.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
}

async function create(input) {
  const announcement = await prisma.announcement.create({ data: input });
  await invalidate(CACHE_KEYS.publicAnnouncements);
  return announcement;
}

async function update(id, patch) {
  const announcement = await prisma.announcement.update({ where: { id }, data: patch });
  await invalidate(CACHE_KEYS.publicAnnouncements);
  return announcement;
}

async function remove(id) {
  await prisma.announcement.delete({ where: { id } });
  await invalidate(CACHE_KEYS.publicAnnouncements);
}

module.exports = { getAll, create, update, remove };
