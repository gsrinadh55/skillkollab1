import dotenv from 'dotenv'

dotenv.config()

function toNumber(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseOrigins(value) {
  return (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS ?? process.env.CLIENT_ORIGIN),
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  databaseUrl: process.env.DATABASE_URL ?? '',
}
