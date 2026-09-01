'use strict';

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var config = require('./config');
var User = require('./api/auth/auth.model');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: config.nodeEnv === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id).then(function(user) { done(null, user); }).catch(done);
});

require('./routes')(app, passport);

app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

mongoose.connect(config.mongoUri)
  .then(function() { console.log('Connected to MongoDB'); })
  .catch(function(err) { console.error('MongoDB connection error:', err.message); });

var server = app.listen(config.port);
server.on('listening', function() { console.log('Server is running on port ' + config.port); });
server.on('error', function(err) {
  console.error('Unable to start server:', err.message);
  process.exitCode = 1;
});
