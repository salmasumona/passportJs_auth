const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const config = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const pageRoutes = require('./routes/page.routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
if (config.isProduction) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.static(path.join(process.cwd(), 'public'), { extensions: ['html'] }));
app.use(session({
  name: 'passport.sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: config.mongoUri, ttl: Math.floor(config.sessionTtlMs / 1000) }),
  cookie: { httpOnly: true, secure: config.cookieSecure, sameSite: config.cookieSameSite, maxAge: config.sessionTtlMs }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', authRoutes);
app.use('/', pageRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
