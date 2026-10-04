import { Router } from 'express'
import * as connectionController from '../controllers/connection.controller.js'
// Using protect middleware if exists. I will check standard auth middleware.

const router = Router()

router.post('/request', connectionController.sendRequest)
router.post('/:id/accept', connectionController.acceptRequest)
router.post('/:id/decline', connectionController.declineRequest)

router.get('/requests', connectionController.getReceivedRequests)
router.get('/sent', connectionController.getSentRequests)
router.get('/status/:userId', connectionController.getConnectionStatus)
router.get('/', connectionController.getConnectedUsers)

export default router
