const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/env');

let server;

async function start() {
  await mongoose.connect(config.mongoUri);
  server = app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));
}

async function shutdown(signal) {
  console.log(`${signal}: shutting down...`);
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.connection.close();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch(err => { console.error('Startup failed:', err); process.exit(1); });
