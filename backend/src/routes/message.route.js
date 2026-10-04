import { Router } from 'express'
import * as messageController from '../controllers/message.controller.js'

const router = Router()

router.get('/direct/:userId', messageController.getDirectMessages)
router.post('/direct/:userId', messageController.sendDirectMessage)

router.get('/channel/:channelId', messageController.getChannelMessages)
router.post('/channel/:channelId', messageController.sendChannelMessage)

export default router
