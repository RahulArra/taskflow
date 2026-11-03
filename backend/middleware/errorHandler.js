import mongoose from 'mongoose'

export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error)
    return
  }

  let statusCode = error.statusCode || 500
  let message = error.message || 'An unexpected server error occurred.'

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    message = Object.values(error.errors).map((item) => item.message).join(' ')
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = 'A supplied value is invalid.'
  } else if (error.name === 'SyntaxError' && error.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'Request body must contain valid JSON.'
  } else if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
    statusCode = 503
    message = 'The database is temporarily unavailable. Please try again.'
  }

  if (statusCode >= 500) {
    console.error(`${req.method} ${req.originalUrl}:`, error)
  }

  res.status(statusCode).json({ message })
}
