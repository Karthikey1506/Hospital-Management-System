// Centralized Express Error Handler Middleware

function errorHandler(err, req, res, next) {
  console.error('[EXPRESS ERROR HANDLER]', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    code: statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}

module.exports = errorHandler;
