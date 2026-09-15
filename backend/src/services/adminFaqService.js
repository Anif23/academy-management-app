const prisma = require('../config/prisma');

async function getAll() {
  return await prisma.fAQ.findMany({
    orderBy: { order: 'asc' },
  });
}

async function create(data) {
  return await prisma.fAQ.create({ data });
}

async function update(id, data) {
  return await prisma.fAQ.update({ where: { id }, data });
}

async function remove(id) {
  await prisma.fAQ.delete({ where: { id } });
}

module.exports = { getAll, create, update, remove };
