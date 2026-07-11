export function notFound(_req, res, next) {
  res.status(404);
  next(new Error('Not found'));
}

export function errorHandler(err, _req, res, _next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Image is too large. Please use a file under 15 MB.' });
  }

  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';
  const exposeMessage = !isProd || status < 500 || status === 503 || status === 502 || status === 429;
  const message = exposeMessage
    ? (err.message || 'Server error')
    : 'Server error';

  if (status >= 500) {
    console.error('[API error]', status, err.message || err);
  }

  res.status(status).json({ message });
}
