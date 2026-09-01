'use strict';

var path = require('path');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

module.exports = function(app, passport) {
  app.use('/auth', require('./api/auth')(passport));
  app.get('/registration', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/registration.html'));
  });
  app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/login.html'));
  });
  app.get('/profile', isAuthenticated, function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/profile.html'));
  });
  app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  });

  // Express 5 requires named wildcards; this also matches the root path.
  app.get('/{*splat}', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/index.html'));
  });
};
