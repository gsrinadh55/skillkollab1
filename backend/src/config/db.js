import { env } from './env.js'

let prismaInstance = null

try {
  const pkg = await import('@prisma/client').catch(() => null)
  if (pkg && pkg.PrismaClient) {
    const { PrismaClient } = pkg
    prismaInstance = new PrismaClient({
      log: env.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    })
  }
} catch (error) {
  console.warn('⚠️ [Prisma Client Note]: @prisma/client not initialized or DB url unset. Defaulting to in-memory store.')
}

export const prisma = prismaInstance || null

let dbStatus = { connected: false, mode: 'INITIALIZING' }

export function getDbStatus() {
  return dbStatus
}

export async function initDb() {
  if (!prisma) {
    console.log('💡 [Offline Evaluation Active]: Server initialized cleanly with high-performance in-memory repository fallbacks! (Zero DB blocking)')
    dbStatus = { connected: false, mode: 'IN_MEMORY_STORE' }
    return dbStatus
  }

  try {
    await prisma.$connect()
    console.log('📦 [Database] Successfully connected to PostgreSQL via Prisma Client.')
    dbStatus = { connected: true, mode: 'POSTGRESQL' }
    return dbStatus
  } catch (error) {
    console.warn('⚠️ [Database Notice]: Could not establish TCP connection to PostgreSQL instance.')
    console.warn('💡 [Offline Evaluation Active]: Switching cleanly to in-memory repository fallbacks!')
    dbStatus = { connected: false, error: error.message, mode: 'IN_MEMORY_STORE' }
    return dbStatus
  }
}

export async function disconnectDb() {
  if (prisma) {
    await prisma.$disconnect().catch(() => { })
  }
}
