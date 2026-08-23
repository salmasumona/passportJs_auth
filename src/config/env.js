require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const config = {
  env,
  isProduction,
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/passport_auth',
  sessionSecret: process.env.SESSION_SECRET || (isProduction ? '' : 'development-only-change-me'),
  sessionTtlMs: Number(process.env.SESSION_TTL_MS || 86400000),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax'
};

if (!config.sessionSecret) throw new Error('SESSION_SECRET must be set in production.');
if (config.sessionSecret.length < 32 && isProduction) throw new Error('SESSION_SECRET must be at least 32 characters in production.');

module.exports = config;
