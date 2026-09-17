import { AppError } from '../utils/app-error.js'

export function errorMiddleware(error, request, response, next) {
  if (response.headersSent) {
    next(error)
    return
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500
  const code = error instanceof AppError ? error.code : 'INTERNAL_SERVER_ERROR'
  const message = error.message || 'Unexpected server error'

  response.status(statusCode).json({
    message,
    code,
    ...(process.env.NODE_ENV === 'development'
      ? {
          stack: error.stack,
        }
      : {}),
  })
}
