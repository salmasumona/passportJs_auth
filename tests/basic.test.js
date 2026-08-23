const test = require('node:test');
const assert = require('node:assert/strict');

test('project metadata is modernized', () => {
  const pkg = require('../package.json');
  assert.equal(pkg.main, 'src/server.js');
  assert.match(pkg.engines.node, />=20/);
  assert.ok(pkg.dependencies.express);
  assert.ok(pkg.dependencies.passport);
  assert.ok(pkg.dependencies['express-rate-limit']);
});
