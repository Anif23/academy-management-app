require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing or empty required environment variable: ${name}`);
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
  publicFrontendUrl: process.env.FRONTEND_PUBLIC_URL || 'http://localhost:5174',
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  awsRegion: process.env.AWS_REGION || '',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',
  // Standard AWS SDK env var names — picked up automatically by the
  // default credential provider chain, but read explicitly here too so we
  // can tell at boot whether S3 is actually configured.
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  // Optional CDN / custom domain in front of the bucket (e.g. CloudFront).
  // When unset, files are served straight from the bucket's own URL.
  awsS3PublicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL || '',
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '200', 10),

  get s3Configured() {
    return Boolean(this.awsRegion && this.awsS3Bucket);
  },
};

module.exports = env;
