// Consistent JSON error shape (mirrors RFC 7807 ProblemDetails).
export function notFound(req, res) {
  res.status(404).json({
    type: 'about:blank',
    title: 'Not Found',
    status: 404,
    detail: `No route for ${req.method} ${req.originalUrl}`,
  });
}

// Postgres error codes we can safely surface as client errors.
const PG_CLIENT_ERRORS = {
  '23503': 'Referenced record does not exist',
  '23505': 'Conflict: record already exists',
  '23514': 'Value violates a constraint',
  '22P02': 'Malformed value',
  '22003': 'Numeric value out of range',
};

export function errorHandler(err, _req, res, _next) {
  const mapped = err.code && PG_CLIENT_ERRORS[err.code];
  const status = err.status || (mapped ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    type: 'about:blank',
    title: err.title || (status >= 500 ? 'Internal Server Error' : 'Request Error'),
    status,
    detail: status >= 500 ? 'An unexpected error occurred.' : mapped || err.message,
  });
}

export class ApiError extends Error {
  constructor(status, message, title) {
    super(message);
    this.status = status;
    this.title = title;
  }
}
