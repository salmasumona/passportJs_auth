const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.use('local-login', new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, async (username, password, done) => {
  try {
    const user = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }] }).select('+password');
    if (!user) return done(null, false, { message: 'Invalid username/email or password.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return done(null, false, { message: 'Invalid username/email or password.' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); } catch (err) { done(err); }
});

module.exports = passport;
