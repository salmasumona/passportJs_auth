'use strict';

require('dotenv').config({ quiet: true });

var parsedPort = Number.parseInt(process.env.PORT, 10);

module.exports = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost/authPassport',
  port: Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535 ? parsedPort : 1800,
  url: process.env.APP_URL || 'http://localhost:1800',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  nodeEnv: process.env.NODE_ENV || 'development'
};
