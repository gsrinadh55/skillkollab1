import { getStore } from '../services/store.service.js'
import { asyncHandler } from '../middlewares/async-handler.js'

export const sendRequest = asyncHandler(async (req, res) => {
  const store = getStore()
  // Use mock auth user if no real auth is available, normally req.user.id
  const currentUserId = req.user?.id || 'usr-1' 
  const { receiverId } = req.body

  if (!receiverId) {
    return res.status(400).json({ error: 'receiverId is required' })
  }
  if (currentUserId === receiverId) {
    return res.status(400).json({ error: 'Cannot connect with yourself' })
  }

  // Check if connection already exists
  const existingConn = await store.getConnection(currentUserId, receiverId)
  if (existingConn) {
    return res.status(400).json({ error: 'Connection or request already exists' })
  }

  const conn = await store.createConnection(currentUserId, receiverId)
  
  res.status(201).json({
    status: 'success',
    data: conn
  })
})

export const acceptRequest = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'
  const { id } = req.params

  const connections = await store.getConnectionsByUser(currentUserId)
  const conn = connections.find(c => c.id === id)

  if (!conn) {
    return res.status(404).json({ error: 'Connection request not found' })
  }
  
  // Can only accept if we are the receiver
  if (conn.receiverId !== currentUserId) {
    return res.status(403).json({ error: 'Not authorized to accept this request' })
  }
  
  if (conn.status !== 'PENDING') {
    return res.status(400).json({ error: 'Request is not pending' })
  }

  const updatedConn = await store.updateConnectionStatus(id, 'ACCEPTED')

  res.json({
    status: 'success',
    data: updatedConn
  })
})

export const declineRequest = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'
  const { id } = req.params

  const connections = await store.getConnectionsByUser(currentUserId)
  const conn = connections.find(c => c.id === id)

  if (!conn) {
    return res.status(404).json({ error: 'Connection request not found' })
  }
  
  // Can only decline if we are the receiver
  if (conn.receiverId !== currentUserId) {
    return res.status(403).json({ error: 'Not authorized to decline this request' })
  }

  const updatedConn = await store.updateConnectionStatus(id, 'DECLINED')

  res.json({
    status: 'success',
    data: updatedConn
  })
})

export const getReceivedRequests = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'

  const connections = await store.getConnectionsByUser(currentUserId)
  const received = connections.filter(c => c.receiverId === currentUserId && c.status === 'PENDING')

  res.json({
    status: 'success',
    data: received
  })
})

export const getSentRequests = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'

  const connections = await store.getConnectionsByUser(currentUserId)
  const sent = connections.filter(c => c.requesterId === currentUserId && c.status === 'PENDING')

  res.json({
    status: 'success',
    data: sent
  })
})

export const getConnectedUsers = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'

  const connections = await store.getConnectionsByUser(currentUserId)
  const accepted = connections.filter(c => c.status === 'ACCEPTED')

  res.json({
    status: 'success',
    data: accepted
  })
})

export const getConnectionStatus = asyncHandler(async (req, res) => {
  const store = getStore()
  const currentUserId = req.user?.id || 'usr-1'
  const targetUserId = req.params.userId

  const conn = await store.getConnection(currentUserId, targetUserId)
  
  if (!conn) {
    return res.json({ status: 'success', data: { status: 'NONE' } })
  }
  
  // Refine the status based on who sent it if pending
  let status = conn.status
  if (status === 'PENDING') {
    status = conn.requesterId === currentUserId ? 'PENDING_SENT' : 'PENDING_RECEIVED'
  }

  res.json({
    status: 'success',
    data: {
      id: conn.id,
      status,
      connection: conn
    }
  })
})
