const express = require('express');
const path = require('path');
const router = express.Router();
const publicDir = path.join(process.cwd(), 'public');

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/login.html');
}

router.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
router.get('/profile', requireAuth, (_req, res) => res.sendFile(path.join(publicDir, 'profile.html')));
router.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

module.exports = router;
