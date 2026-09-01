const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// A single shared Prisma instance for the whole process. Creating a new
// PrismaClient per request would exhaust the database's connection pool.
const prisma = new PrismaClient({
  log: env.isProduction ? ['error', 'warn'] : ['warn', 'error'],
});

module.exports = prisma;
