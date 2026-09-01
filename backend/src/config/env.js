require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isProduction: process.env.NODE_ENV === 'production',

  databaseUrl: required('DATABASE_URL'),

  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  redisUrl: process.env.REDIS_URL || '',

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  awsRegion: process.env.AWS_REGION || '',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',
};

module.exports = env;
