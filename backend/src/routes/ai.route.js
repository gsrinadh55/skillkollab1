import { Router } from 'express'
import { AiController } from '../controllers/ai.controller.js'
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js'

const aiRouter = Router()

aiRouter.post('/mentor', AiController.askMentor)
aiRouter.get('/diagnose/:projectId', AiController.diagnoseProject)
aiRouter.post('/match', AiController.matchTeam)
aiRouter.post('/recommend-roles', optionalAuth, AiController.recommendRoles)
aiRouter.post('/generate-milestones', AiController.generateMilestones)

export default aiRouter
