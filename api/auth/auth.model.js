const mongoose = require("mongoose");

const UserInfoSchema = new mongoose.Schema({
  FirstName: { type: String, trim: true, maxlength: 80 },
  LastName: { type: String, trim: true, maxlength: 80 },
  photo: { type: String, trim: true, maxlength: 500 },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 30,
    lowercase: true,
    match: /^[a-z0-9._-]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  created: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model("Users", UserInfoSchema);
