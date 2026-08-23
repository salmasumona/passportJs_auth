const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const passport = require('../config/passport');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many authentication attempts. Try again later.' } });
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || username.length < 4 || username.length > 30) return res.status(400).json({ error: 'Username must be 4-30 characters.' });
    if (!email || !emailRegex.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match.' });

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] });
    if (exists) return res.status(409).json({ error: 'Username or email is already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username: normalizedUsername, email: normalizedEmail, password: hashed });
    req.login(user, err => {
      if (err) return next(err);
      return res.status(201).json({ message: 'Registration successful.', user: user.toJSON() });
    });
  } catch (err) { next(err); }
});

router.post('/login', authLimiter, (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Authentication failed.' });
    req.login(user, err2 => {
      if (err2) return next(err2);
      return res.json({ message: 'Login successful.', user: user.toJSON() });
    });
  })(req, res, next);
});

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err2 => {
      if (err2) return next(err2);
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully.' });
    });
  });
});

router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ user: req.user.toJSON() });
});

module.exports = router;
