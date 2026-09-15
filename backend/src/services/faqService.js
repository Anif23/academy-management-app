const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function getActiveFAQs() {
  return await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

async function create(input) {
  const faq = await prisma.fAQ.create({
    data: input,
  });
  return faq;
}

module.exports = { getActiveFAQs, create };
