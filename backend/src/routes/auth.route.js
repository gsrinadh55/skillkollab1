import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const authRouter = Router()

authRouter.post('/register', AuthController.register)
authRouter.post('/login', AuthController.login)
authRouter.get('/me', requireAuth, AuthController.getMe)
authRouter.post('/onboarding', requireAuth, AuthController.submitOnboarding)
authRouter.post('/sync', requireAuth, AuthController.syncFirebaseUser)
authRouter.post('/forgot-password', AuthController.forgotPassword)
authRouter.post('/reset-password', AuthController.resetPassword)

export default authRouter
