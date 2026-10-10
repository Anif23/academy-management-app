const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./config/prisma');
const permissionsService = require('./services/permissionsService');

async function start() {
  // Loads (and, on first-ever run, seeds) the role→permission cache that
  // every permission-gated request reads synchronously — must finish
  // before the server accepts traffic, or the very first requests would
  // fall through to the static-file fallback in permissionsService.
  await permissionsService.initialize();

  const server = app.listen(env.port, () => {
    logger.info(`Academy backend listening on port ${env.port} (${env.nodeEnv})`);
  });

  return server;
}

const serverPromise = start();

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  const server = await serverPromise;
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Force-exit if graceful shutdown hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});
