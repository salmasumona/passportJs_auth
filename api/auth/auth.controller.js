'use strict';

var bcrypt = require('bcryptjs');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./auth.model');
var validation = require('../../utils/validation');

exports.configure = function(passport) {
  passport.use('registration', new LocalStrategy({ passReqToCallback: true }, async function(req, username, password, done) {
    var body = Object.assign({}, req.body, { username: username, password: password });
    var input = validation.validateRegistration(body);
    if (!input.valid) {
      return done(null, false, { message: input.errors[0] });
    }

    try {
      var existingUser = await User.findOne({ $or: [{ username: input.username }, { email: input.email }] });
      if (existingUser) {
        return done(null, false, { message: 'A user with that username or email already exists.' });
      }

      var user = await User.create({
        username: input.username,
        email: input.email,
        password: await bcrypt.hash(input.password, 12)
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
    var input = validation.validateLogin({ username: username, password: password });
    if (!input.valid) {
      return done(null, false, { message: input.errors[0] });
    }

    try {
      var identifier = input.identifier;
      var user = await User.findOne({ $or: [{ username: identifier }, { email: identifier.toLowerCase() }] });
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        return done(null, false, { message: 'Invalid username/email or password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};
