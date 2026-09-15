const prisma = require('../config/prisma');

async function getAll() {
  return await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function create(data) {
  return await prisma.testimonial.create({ data });
}

async function update(id, data) {
  return await prisma.testimonial.update({ where: { id }, data });
}

async function remove(id) {
  await prisma.testimonial.delete({ where: { id } });
}

module.exports = { getAll, create, update, remove };
