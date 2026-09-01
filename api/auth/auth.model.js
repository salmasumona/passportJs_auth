'use strict';

var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  photo: String,
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Users || mongoose.model('Users', userSchema);
