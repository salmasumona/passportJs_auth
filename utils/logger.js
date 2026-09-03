'use strict';

function write(level, message, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message
  };
  if (meta && typeof meta === 'object') entry.meta = meta;
  process.stdout.write(JSON.stringify(entry) + '\n');
}

module.exports = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta)
};
