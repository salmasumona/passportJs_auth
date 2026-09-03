'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRegistration, validateLogin } = require('../utils/validation');

test('registration accepts valid input', () => {
  const result = validateRegistration({ username: 'sumona_1', email: 'User@Example.com', password: 'Password123', cpassword: 'Password123' });
  assert.equal(result.valid, true);
  assert.equal(result.email, 'user@example.com');
});

test('registration rejects weak password and mismatch', () => {
  const result = validateRegistration({ username: 'user1', email: 'user@example.com', password: '123', cpassword: '456' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 2);
});

test('login rejects missing credentials', () => {
  const result = validateLogin({ username: '', password: '' });
  assert.equal(result.valid, false);
});

test('login accepts username and password', () => {
  const result = validateLogin({ username: 'sumona', password: 'Password123' });
  assert.equal(result.valid, true);
});
