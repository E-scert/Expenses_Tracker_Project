// Wraps an async route handler so thrown errors/rejections reach Express's
// error-handling middleware instead of crashing the process.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Turns raw Postgres errors into clean, consistent JSON the frontend can show.
function formatPgError(err) {
  const known = {
    23505: 'That value already exists — please choose a different one.',
    23503: 'This record is referenced elsewhere and cannot be used like this.',
    23502: 'A required field is missing.',
    23514: 'That value violates a database constraint (e.g. amount must be positive, category must be valid).',
    '42P01': 'A database table is missing. Have you run the schema?',
  };
  if (err.code && known[err.code]) return known[err.code];
  if (err.message) return err.message;
  return 'Unexpected database error.';
}

module.exports = { asyncHandler, formatPgError };
