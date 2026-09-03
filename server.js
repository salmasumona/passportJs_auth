'use strict';

require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/config');
const User = require('./api/auth/auth.model');

const app = express();

if (!config.sessionSecret || config.sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be set and contain at least 32 characters.');
}

if (!config.mongoUri) {
  throw new Error('MONGO_URI must be configured.');
}

if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id)
    .then(function(user) { done(null, user); })
    .catch(done);
});

// Lightweight endpoint for NGINX/EC2/GitHub Actions health checks.
app.get('/health', function(req, res) {
  const state = require('mongoose').connection.readyState;
  if (state === 1) {
    return res.status(200).json({ status: 'ok', database: 'connected' });
  }
  return res.status(503).json({ status: 'degraded', database: 'disconnected' });
});

require('./routes')(app, passport);

app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

async function start() {
  try {
    await connectDB();
    const server = app.listen(config.port, '127.0.0.1', function() {
      console.log('Server is running on 127.0.0.1:' + config.port);
    });

    const shutdown = function(signal) {
      console.log(signal + ' received. Shutting down...');
      server.close(function() {
        require('mongoose').connection.close(false).finally(function() {
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', function() { shutdown('SIGTERM'); });
    process.on('SIGINT', function() { shutdown('SIGINT'); });
  } catch (err) {
    console.error('Application startup failed:', err.message);
    process.exit(1);
  }
}

start();
