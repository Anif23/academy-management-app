const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const fs = require('fs'); // Added for directory checking
const path = require('path'); // Added for accurate path resolution

const env = require('./config/env');
const logger = require('./config/logger');
const apiRoutes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Automatically create the uploads directory if it is missing (crucial for AWS)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info('Created missing uploads directory');
}

// Behind a load balancer/reverse proxy in production, so rate limiting and
// secure cookies see the real client IP/protocol.
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [env.frontendUrl, env.publicFrontendUrl];

      // No Origin header (server-to-server, curl, mobile apps) — allow.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In non-production, be forgiving of any localhost/127.0.0.1 port —
      // during local dev it's extremely common for Vite to pick a
      // different port than whatever's in .env (5173 taken -> 5174, etc.),
      // and a silent CORS rejection there is a confusing dead end that
      // looks like "nothing works" with no useful error message.
      if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
app.use(apiLimiter);

app.get('/health', (req, res) => res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() }));

app.use('/uploads', express.static('uploads'));
app.use('/api', apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
