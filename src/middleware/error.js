function notFound(req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Route not found' });
  return res.status(404).sendFile(require('path').join(process.cwd(), 'public', '404.html'));
}

function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  if (req.path.startsWith('/api/')) return res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
  return res.status(status).send('Something went wrong.');
}

module.exports = { notFound, errorHandler };
