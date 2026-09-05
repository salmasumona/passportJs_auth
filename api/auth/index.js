'use strict';

var express = require('express');
var jwt = require('jsonwebtoken');
var authController = require('./auth.controller');
var config = require('../../config/config');
var authenticateToken = require('../../middleware/auth');

function setAuthCookie(res, token) {
  var parts = [
    'access_token=' + encodeURIComponent(token),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + 60 * 60
  ];
  if (config.nodeEnv === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearAuthCookie(res) {
  var parts = [
    'access_token=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  if (config.nodeEnv === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

module.exports = function(passport) {
  var router = express.Router();
  authController.configure(passport);

  function authenticate(strategy, successStatus) {
    return function(req, res, next) {
      passport.authenticate(strategy, { session: false }, function(err, user, info) {
        if (err) return next(err);
        if (!user) {
          return res.status(400).json({
            message: info && info.message ? info.message : 'Authentication failed.'
          });
        }

        var token = jwt.sign(
          { sub: user.id, username: user.username },
          config.jwtSecret,
          { expiresIn: config.jwtExpiresIn }
        );

        setAuthCookie(res, token);
        return res.status(successStatus).json({
          username: user.username,
          token: token,
          expiresIn: config.jwtExpiresIn
        });
      })(req, res, next);
    };
  }

  router.post('/registration', authenticate('registration', 201));
  router.post('/login', authenticate('login', 200));

  router.get('/me', authenticateToken, function(req, res) {
    return res.status(200).json({
      id: req.user.sub,
      username: req.user.username
    });
  });

  router.post('/logout', function(req, res) {
    clearAuthCookie(res);
    return res.status(200).json({ message: 'Logged out successfully.' });
  });

  return router;
};
