const prisma = require('../config/prisma');
const { invalidate } = require('../utils/cache');
const { CACHE_KEYS } = require('../constants/cacheKeys');

async function getAll() {
  return prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
}

async function create(data) {
  const faq = await prisma.fAQ.create({ data });
  await invalidate(CACHE_KEYS.publicFaqs);
  return faq;
}

async function update(id, data) {
  const faq = await prisma.fAQ.update({ where: { id }, data });
  await invalidate(CACHE_KEYS.publicFaqs);
  return faq;
}

async function remove(id) {
  await prisma.fAQ.delete({ where: { id } });
  await invalidate(CACHE_KEYS.publicFaqs);
}

module.exports = { getAll, create, update, remove };
