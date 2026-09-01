const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const env = require('./config/env');
const logger = require('./config/logger');
const apiRoutes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Behind a load balancer/reverse proxy in production, so rate limiting and
// secure cookies see the real client IP/protocol.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
app.use(apiLimiter);

app.get('/health', (req, res) => res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api', apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
