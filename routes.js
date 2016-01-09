'use strict';
/**
 * Main application routes
 */
var isAuthenticated = function (req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler 
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects
  if (req.isAuthenticated())
    return next();
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/');
}

//var errors = require('./components/errors');
module.exports = function(app,passport) {

  app.use('/auth', require('./api/auth')(passport));  
  
  app.get('/registration',function(req,res){
	  res.sendFile(__dirname + "/public/view/registration.html");
	});
  app.get('/login',function(req,res){
    res.sendFile(__dirname + "/public/view/login.html");
  });
  
   /* GET Home Page */
  app.get('/profile', isAuthenticated, function(req, res){
    res.sendFile(__dirname + "/public/view/profile.html");
  });
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(__dirname + "/public/view/index.html");
    });
  
};
