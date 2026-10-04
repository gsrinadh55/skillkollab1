import { Router } from 'express'
import healthRouter from './health.route.js'
import authRouter from './auth.route.js'
import projectRouter from './project.route.js'
import aiRouter from './ai.route.js'
import connectionRouter from './connection.route.js'
import messageRouter from './message.route.js'
import organizationRouter from './organization.route.js'

const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/projects', projectRouter)
apiRouter.use('/ai', aiRouter)
apiRouter.use('/connections', connectionRouter)
apiRouter.use('/messages', messageRouter)
apiRouter.use('/organizations', organizationRouter)

apiRouter.get('/', (request, response) => {
  response.status(200).json({
    name: 'SkillKollab API',
    version: 'v1',
    status: 'online',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/projects',
      '/api/ai/mentor',
      '/api/ai/diagnose/:projectId'
    ],
  })
})

export default apiRouter
