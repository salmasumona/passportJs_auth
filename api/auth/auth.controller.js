var express = require("express");
var app   = express();
var config  = require("../../config");
var User = require('./auth.model');
var mongoose = require('mongoose');

var bcrypt  = require("bcryptjs");
var commonService = require('../common/getDate');
var LocalStrategy   = require('passport-local').Strategy;

/*
*
* Check user already exists or not
* If exists then return "Exixts" message
* Otherwise insert username into Db and return "Save" message
*
*/
exports.registration = function(passport){
console.log("2-------"); 
      
      passport.use('registration', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
          if(req.body.username!="" && req.body.username.length>=4 && req.body.password!=undefined && req.body.password==req.body.cpassword){
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.cpassword, salt);
            var cpassword = hash; 
              findOrCreateUser = function(){
                  // find a user in Mongo with provided username
                  User.findOne({$or:[ {'username': username}, {'email': req.body.email}]}, function(err, user) {
                      // In case of any error, return using the done method
                      if (err){
                         // console.log('Error in SignUp: '+err);
                          return done(err);
                      }
                      // already exists
                      if (user ) {
                          if(user.username==username) return done(null, false, {message:'User already exists with username: '+username});
                          if(user.email==req.body.email) return done(null, false, {message:'User already exists with email: '+req.body.email});
                      } else {
                          // if there is no user with that email
                          // create the user
                          var newUser = new User();

                          // set the user's local credentials
                          newUser.username = username;
                          newUser.password = cpassword;
                          newUser.email = req.body.email;
                          newUser.created = commonService.getDate();

                          // save the user
                          newUser.save(function(err) {
                              if (err){
                                  console.log('Error in Saving user: '+err);  
                                  throw err;  
                              }
                              console.log('User Registration succesful');    
                              return done(null, newUser);
                          });
                      }
                  });
              };
            }
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );
 

   
}


// login if username and password matched , otherwise return "Not Exists" message
exports.login = function(passport){

   passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
             if(req.body.username!="" && req.body.username.length>=4 && req.body.password!=undefined){
              // check in mongo if a user with username exists or not
              User.findOne({$or:[{'username':username},{'email':username}]}, 
                  function(err, user) {
                      // In case of any error, return using the done method
                      if (err)
                          return done(err);
                      // Username does not exist, log the error and redirect back
                      if (!user){
                          console.log('User Not Found with username '+username);
                          return done(null, false, {message: 'User Not found.'});                 
                      }
                      // User exists but wrong password, log the error 
                      if (!isValidPassword(user, password)){
                          console.log('Invalid Password');
                          return done(null, false, {message: 'Invalid Password'}); // redirect back to login page
                      }
                      // User and password both match, return user from done method
                      // which will be treated like success
                      return done(null, user);
                  }
              );
            }

        })
    );


    var isValidPassword = function(user, password){
        return bcrypt.compareSync(password, user.password);
    }

};
