const pino = require('pino');
const env = require('./env');

const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : env.isProduction ? 'info' : 'debug',
  transport:
    env.isProduction || process.env.NODE_ENV === 'test'
      ? undefined
      : {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash', '*.token'],
});

module.exports = logger;
