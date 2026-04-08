/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, _next) {
  // If the error has a status (thrown by services), use it
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log server errors
  if (statusCode >= 500) {
    console.error('❌ Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
}

module.exports = errorHandler;
