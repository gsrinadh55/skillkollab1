export function notFoundMiddleware(request, response) {
  response.status(404).json({
    message: `Route not found: ${request.originalUrl}`,
    code: 'NOT_FOUND',
  })
}
