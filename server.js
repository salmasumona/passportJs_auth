'use strict';

require('dotenv').config({ quiet: true });

const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const passport = require('passport');
const config = require('./config/config');
const securityHeaders = require('./middleware/security');
const createRateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

if (!config.jwtSecret || config.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set and contain at least 32 characters.');
}
if (!config.mongoUri) {
  throw new Error('MONGO_URI must be configured.');
}

if (config.nodeEnv === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));

app.use(passport.initialize());

app.get('/health', function(req, res) {
  const state = mongoose.connection.readyState;
  if (state === 1) return res.status(200).json({ status: 'ok', database: 'connected' });
  return res.status(503).json({ status: 'degraded', database: 'disconnected' });
});

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/auth', authLimiter);
require('./routes')(app, passport);

app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error('Unhandled application error', { method: req.method, path: req.path, error: err.message });
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

async function start() {
  try {
    await connectDB();
    const server = app.listen(config.port, config.host, function() {
      logger.info('Server started', { host: config.host, port: config.port, env: config.nodeEnv });
    });

    const shutdown = function(signal) {
      logger.info('Shutdown requested', { signal });
      server.close(function() {
        mongoose.connection.close(false).finally(function() { process.exit(0); });
      });
    };
    process.on('SIGTERM', function() { shutdown('SIGTERM'); });
    process.on('SIGINT', function() { shutdown('SIGINT'); });
  } catch (err) {
    logger.error('Application startup failed', { error: err.message });
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = { app, start };
