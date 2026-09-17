import { Router } from 'express'
import { AiController } from '../controllers/ai.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const aiRouter = Router()

aiRouter.post('/mentor', AiController.askMentor)
aiRouter.get('/diagnose/:projectId', AiController.diagnoseProject)
aiRouter.post('/match', AiController.matchTeam)

export default aiRouter
