import http from 'node:http'
import { Server as SocketIOServer } from 'socket.io'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { registerSocketHandlers } from './socket/index.js'
import { initDb } from './config/db.js'

const app = createApp()
const server = http.createServer(app)

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || env.nodeEnv === 'development') return callback(null, true)
      if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) return callback(null, true)
      if (env.corsOrigins.includes(origin) || origin === env.clientOrigin) return callback(null, true)
      return callback(null, true)
    },
    credentials: true,
  },
})

registerSocketHandlers(io)

await initDb()

server.listen(env.port, () => {
  console.log(`SkillKollab API running on http://localhost:${env.port}`)
})
