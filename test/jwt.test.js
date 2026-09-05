'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

test('JWT can be signed and verified', () => {
  const secret = 'test-secret-that-is-at-least-32-characters-long';
  const token = jwt.sign({ sub: '123', username: 'sumona' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);

  assert.equal(decoded.sub, '123');
  assert.equal(decoded.username, 'sumona');
});

test('JWT verification rejects the wrong secret', () => {
  const token = jwt.sign({ sub: '123' }, 'test-secret-that-is-at-least-32-characters-long');

  assert.throws(() => {
    jwt.verify(token, 'another-secret-that-is-at-least-32-characters');
  });
});
