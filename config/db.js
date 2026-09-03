'use strict';

const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured. Copy .env.example to .env and set it.');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  });

  console.log('MongoDB Atlas connected successfully');
}

module.exports = connectDB;
