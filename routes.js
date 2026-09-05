'use strict';

var path = require('path');

module.exports = function(app, passport) {
  app.use('/auth', require('./api/auth')(passport));
  app.get('/registration', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/registration.html'));
  });
  app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/login.html'));
  });
  app.get('/profile', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/profile.html'));
  });
  app.get('/logout', function(req, res) {
    res.setHeader('Set-Cookie', [
      'access_token=',
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=0'
    ].concat(process.env.NODE_ENV === 'production' ? ['Secure'] : []).join('; '));
    return res.redirect('/');
  });

  // Express 5 requires named wildcards; this also matches the root path.
  app.get('/{*splat}', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/view/index.html'));
  });
};
