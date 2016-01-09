'use strict';

var express = require('express');
var authcontroller = require('./auth.controller');

var router = express.Router();
module.exports = function(passport){
	
		authcontroller.registration(passport);
		authcontroller.login(passport);
		
		router.post('/registration', function(req, res, next) {
		  passport.authenticate('registration', { session: true }, function (err, user, info) {
		  	if (err) { return next(err); }
		    if (!user) return res.json(info.message);
		    req.logIn(user, function(err) {
		      if (err) { return next(err); }
		      return res.json({username:user.username});
		    });
		  })(req, res, next)
		});

		router.post('/login', function(req, res, next) {
		  passport.authenticate('login', function (err, user, info) {
		  	if (err) { return next(err); }
		    if (!user) return res.json(info.message);
		    req.logIn(user, function(err) {
		      if (err) { return next(err); }
		      return res.json({username:user.username});
		    });

		  })(req, res, next)
		});

		return router;
};