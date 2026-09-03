'use strict';

require('dotenv').config({ quiet: true });

const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/config');
const User = require('./api/auth/auth.model');
const securityHeaders = require('./middleware/security');
const createRateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

if (!config.sessionSecret || config.sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be set and contain at least 32 characters.');
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

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) { done(null, user.id); });
passport.deserializeUser(function(id, done) {
  User.findById(id).then(function(user) { done(null, user); }).catch(done);
});

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
    const server = app.listen(config.port, '127.0.0.1', function() {
      logger.info('Server started', { host: '127.0.0.1', port: config.port, env: config.nodeEnv });
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
