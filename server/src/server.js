import http from 'node:http'
import { Server as SocketIOServer } from 'socket.io'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { registerSocketHandlers } from './socket/index.js'

const app = createApp()
const server = http.createServer(app)

const io = new SocketIOServer(server, {
  cors: {
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : env.clientOrigin,
    credentials: true,
  },
})

registerSocketHandlers(io)

server.listen(env.port, () => {
  console.log(`SkillKollab API running on http://localhost:${env.port}`)
})
