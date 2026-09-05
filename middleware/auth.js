'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config');

function getToken(req) {
  const authHeader = req.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.get('cookie');
  if (!cookieHeader) return null;

  const tokenCookie = cookieHeader
    .split(';')
    .map(function(part) { return part.trim(); })
    .find(function(part) { return part.startsWith('access_token='); });

  return tokenCookie ? decodeURIComponent(tokenCookie.slice('access_token='.length)) : null;
}

function authenticateToken(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authenticateToken;
