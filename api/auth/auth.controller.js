'use strict';

var bcrypt = require('bcryptjs');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./auth.model');

function hasCredentials(username, password) {
  return typeof username === 'string' && username.trim().length >= 4 &&
    typeof password === 'string' && password.length > 0;
}

exports.configure = function(passport) {
  passport.use('registration', new LocalStrategy({ passReqToCallback: true }, async function(req, username, password, done) {
    if (!hasCredentials(username, password) || typeof req.body.email !== 'string' ||
      !req.body.email.trim() || password !== req.body.cpassword) {
      return done(null, false, { message: 'Provide a username, email, and matching password (username must be at least 4 characters).' });
    }

    try {
      var normalizedUsername = username.trim();
      var normalizedEmail = req.body.email.trim().toLowerCase();
      var existingUser = await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] });
      if (existingUser) {
        return done(null, false, { message: 'A user with that username or email already exists.' });
      }

      var user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: await bcrypt.hash(password, 12)
      });
      return done(null, user);
    } catch (err) {
      if (err && err.code === 11000) {
        return done(null, false, { message: 'A user with that username or email already exists.' });
      }
      return done(err);
    }
  }));

  passport.use('login', new LocalStrategy({ passReqToCallback: true }, async function(req, username, password, done) {
    if (!hasCredentials(username, password)) {
      return done(null, false, { message: 'Provide a valid username or email and password.' });
    }

    try {
      var identifier = username.trim();
      var user = await User.findOne({ $or: [{ username: identifier }, { email: identifier.toLowerCase() }] });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Invalid username/email or password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};
