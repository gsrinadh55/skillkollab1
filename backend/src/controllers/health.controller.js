export function getHealth(request, response) {
  response.status(200).json({
    status: 'ok',
    service: 'skillkollab-api',
    environment: process.env.NODE_ENV ?? 'development',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
}
