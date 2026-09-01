'use strict';

var express = require('express');
var authController = require('./auth.controller');

module.exports = function(passport) {
  var router = express.Router();
  authController.configure(passport);

  function authenticate(strategy, successStatus) {
    return function(req, res, next) {
      passport.authenticate(strategy, function(err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(400).json({ message: info && info.message ? info.message : 'Authentication failed.' });
        }
        return req.logIn(user, function(loginErr) {
          if (loginErr) {
            return next(loginErr);
          }
          return res.status(successStatus).json({ username: user.username });
        });
      })(req, res, next);
    };
  }

  router.post('/registration', authenticate('registration', 201));
  router.post('/login', authenticate('login', 200));
  return router;
};
