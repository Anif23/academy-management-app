const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./config/prisma');

const server = app.listen(env.port, () => {
  logger.info(`Academy backend listening on port ${env.port} (${env.nodeEnv})`);
});

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
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
