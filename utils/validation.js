'use strict';

function normalizeUsername(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function validateRegistration(body) {
  const username = normalizeUsername(body && body.username);
  const email = normalizeEmail(body && body.email);
  const password = typeof (body && body.password) === 'string' ? body.password : '';
  const cpassword = typeof (body && body.cpassword) === 'string' ? body.cpassword : '';
  const errors = [];

  if (!/^[A-Za-z0-9_.-]{4,30}$/.test(username)) {
    errors.push('Username must be 4-30 characters and contain only letters, numbers, _, ., or -.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.push('Please provide a valid email address.');
  }
  if (password.length < 8 || password.length > 128) {
    errors.push('Password must be 8-128 characters.');
  }
  if (password !== cpassword) {
    errors.push('Password and confirm password must match.');
  }

  return { valid: errors.length === 0, errors, username, email, password, cpassword };
}

function validateLogin(body) {
  const identifier = typeof (body && body.username) === 'string' ? body.username.trim() : '';
  const password = typeof (body && body.password) === 'string' ? body.password : '';
  const errors = [];

  if (identifier.length < 4 || identifier.length > 254) {
    errors.push('Username/email must be 4-254 characters.');
  }
  if (!password) {
    errors.push('Password is required.');
  }

  return { valid: errors.length === 0, errors, identifier, password };
}

module.exports = { normalizeUsername, normalizeEmail, validateRegistration, validateLogin };
