import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import apiRouter from './routes/index.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import { notFoundMiddleware } from './middlewares/not-found.middleware.js'
import { env } from './config/env.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error('CORS origin not allowed'))
      },
      credentials: true,
    }),
  )
  app.use(helmet())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: env.nodeEnv === 'development' ? 5000 : 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many requests, please try again later.' }
    }),
  )

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'))
  }

  app.get('/api/health', (request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'skillkollab-api',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    })
  })

  app.use('/api', apiRouter)
  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
