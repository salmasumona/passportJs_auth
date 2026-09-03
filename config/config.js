'use strict';

require('dotenv').config({ quiet: true });

const parsedPort = Number.parseInt(process.env.PORT, 10);

module.exports = {
  mongoUri: process.env.MONGO_URI,
  port: Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535 ? parsedPort : 1800,
  url: process.env.APP_URL || 'http://localhost:1800',
  sessionSecret: process.env.SESSION_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development'
};
