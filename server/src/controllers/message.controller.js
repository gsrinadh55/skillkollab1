import { getStore } from '../services/store.service.js'
import { asyncHandler } from '../middlewares/async-handler.js'
import { getSocketServer } from '../socket/index.js'

export const getDirectMessages = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'
  const targetUserId = req.params.userId

  // Verify connection is accepted
  const conn = await store.getConnection(currentUserId, targetUserId)
  if (!conn || conn.status !== 'ACCEPTED') {
    return res.status(403).json({ error: 'You must be connected with this user to view messages.' })
  }

  const conversation = await store.getOrCreateConversation(currentUserId, targetUserId)
  const messages = await store.getDirectMessages(conversation.id)

  res.json({
    status: 'success',
    data: messages
  })
})

export const sendDirectMessage = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'
  const targetUserId = req.params.userId
  const { content } = req.body

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' })
  }

  // Verify connection is accepted
  const conn = await store.getConnection(currentUserId, targetUserId)
  if (!conn || conn.status !== 'ACCEPTED') {
    return res.status(403).json({ error: 'You must be connected with this user to send a message.' })
  }

  const conversation = await store.getOrCreateConversation(currentUserId, targetUserId)
  const msg = await store.createDirectMessage(conversation.id, currentUserId, content)

  // Emit to socket room
  const io = getSocketServer()
  if (io) {
    io.to(`conversation:${conversation.id}`).emit('receive_message', msg)
  }

  res.status(201).json({
    status: 'success',
    data: msg
  })
})

export const getChannelMessages = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'
  const channelId = req.params.channelId

  // Note: Add proper authorization to check if user is in workspace later
  const messages = await store.getChannelMessages(channelId)

  res.json({
    status: 'success',
    data: messages
  })
})

export const sendChannelMessage = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'
  const channelId = req.params.channelId
  const { content } = req.body

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' })
  }

  // Note: Add proper authorization check here
  const msg = await store.createChannelMessage(channelId, currentUserId, content)

  // Emit to socket room
  const io = getSocketServer()
  if (io) {
    io.to(`channel:${channelId}`).emit('receive_message', msg)
  }

  res.status(201).json({
    status: 'success',
    data: msg
  })
})
