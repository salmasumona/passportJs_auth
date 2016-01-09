'use strict';
var express = require("express");
var app 	= express();
var mongoose = require('mongoose');
var config  = require("./config");
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var User = require('./api/auth/auth.model');
mongoose.connect(config.mongoUri).connection;
/*var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we r connected");
});*/
var port = config.port;
var bodyParser = require("body-parser");
//var http = require('http').Server(app);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// Configuring Passport
app.use(expressSession({secret: config.mySecret,resave:true,saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user,done){
	return done(null,user._id);
});
passport.deserializeUser(function(id,done){
	User.findById(id,function(err,user){
		done(err,user);
	});
});

require('./routes')(app,passport);

app.listen(port);
//http.listen(process.env.PORT || 3000);
console.log("Server is running on port "+port);
