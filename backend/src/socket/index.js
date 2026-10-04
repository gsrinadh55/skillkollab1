let ioInstance = null

export function registerSocketHandlers(io) {
  ioInstance = io

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] New client connected: ${socket.id}`)

    // User-specific room for private notifications
    socket.on('join_user', ({ userId }) => {
      if (!userId) return;
      const room = `user:${userId}`
      socket.join(room)
      console.log(`👤 [Socket.IO] User ${userId} joined their personal room`)
      socket.userId = userId // store for presence
    })

    socket.on('join_conversation', ({ conversationId }) => {
      const room = `conversation:${conversationId}`
      socket.join(room)
    })

    socket.on('leave_conversation', ({ conversationId }) => {
      const room = `conversation:${conversationId}`
      socket.leave(room)
    })

    socket.on('join_channel', ({ channelId }) => {
      const room = `channel:${channelId}`
      socket.join(room)
    })

    socket.on('leave_channel', ({ channelId }) => {
      const room = `channel:${channelId}`
      socket.leave(room)
    })

    // Room join for project workspace collaboration
    socket.on('join_workspace', ({ projectId, user }) => {
      const room = `workspace_${projectId}`
      socket.join(room)
      console.log(`👤 [Socket.IO] User ${user?.name || socket.id} joined room: ${room}`)
      
      // Notify teammates that someone joined the sprint workspace
      socket.to(room).emit('teammate_joined', {
        userId: user?.id || socket.id,
        name: user?.name || 'New Teammate',
        timestamp: new Date().toISOString()
      })
    })

    socket.on('leave_workspace', ({ projectId }) => {
      const room = `workspace_${projectId}`
      socket.leave(room)
      console.log(`👤 [Socket.IO] User left room: ${room}`)
    })

    // Real-time Kanban Task movement broadcasting
    socket.on('task_moved', ({ projectId, taskId, newStatus, user }) => {
      const room = `workspace_${projectId}`
      socket.to(room).emit('sync_task_move', { taskId, newStatus, actor: user?.name || 'Teammate' })
    })

    socket.on('task_added', ({ projectId, task, user }) => {
      const room = `workspace_${projectId}`
      socket.to(room).emit('sync_task_add', { task, actor: user?.name || 'Teammate' })
    })

    socket.on('document_added', ({ projectId, document, user }) => {
      const room = `workspace_${projectId}`
      socket.to(room).emit('sync_document_add', { document, actor: user?.name || 'Teammate' })
    })

    socket.on('whiteboard_draw', ({ projectId, canvasData, user }) => {
      const room = `workspace_${projectId}`
      socket.to(room).emit('sync_whiteboard_draw', { canvasData, actor: user?.name || 'Teammate' })
    })

    // Real GitHub Code Push — notify all workspace members when someone pushes to the repo
    socket.on('github_commit_push', ({ projectId, commit, user }) => {
      if (!projectId || !commit) return;
      const room = `workspace_${projectId}`
      socket.to(room).emit('sync_github_push', {
        commit: {
          sha: commit.sha?.substring(0, 7) || '0000000',
          message: commit.message || 'Code update',
          author: user?.name || commit.author || 'Teammate',
          avatar: user?.avatarUrl || `https://github.com/${commit.author || 'ghost'}.png`,
          time: 'Just now',
          branch: 'main',
        },
        actor: user?.name || 'A teammate',
        pushedAt: new Date().toISOString()
      })
      console.log(`📦 [Socket.IO] GitHub push by ${user?.name} broadcast to room ${room}`)
    })

    // Code editor cursor position sync (collaborative awareness)
    socket.on('code_cursor_move', ({ projectId, filePath, line, col, user }) => {
      if (!projectId) return;
      const room = `workspace_${projectId}`
      socket.to(room).emit('sync_code_cursor', {
        userId: socket.id,
        name: user?.name || 'Teammate',
        filePath, line, col
      })
    })

    // Chat messaging via POST endpoint; Socket.IO is just for emitting now
    // BUT we will also provide fallback socket events for optimistic UI or direct socket sending

    socket.on('new_message', (payload) => {
      // payload: { type: 'channel' | 'direct', roomId: '...', message: {...} }
      if (payload.type === 'channel') {
        io.to(`channel:${payload.roomId}`).emit('receive_message', payload.message)
      } else if (payload.type === 'direct') {
        io.to(`conversation:${payload.roomId}`).emit('receive_message', payload.message)
      }
    })

    socket.on('typing_start', (payload) => {
      if (payload.type === 'channel') {
        socket.to(`channel:${payload.roomId}`).emit('typing_start', { userId: socket.userId, name: payload.name })
      } else if (payload.type === 'direct') {
        socket.to(`conversation:${payload.roomId}`).emit('typing_start', { userId: socket.userId, name: payload.name })
      }
    })

    socket.on('typing_stop', (payload) => {
      if (payload.type === 'channel') {
        socket.to(`channel:${payload.roomId}`).emit('typing_stop', { userId: socket.userId })
      } else if (payload.type === 'direct') {
        socket.to(`conversation:${payload.roomId}`).emit('typing_stop', { userId: socket.userId })
      }
    })

    // Connection Events
    socket.on('connection_request', ({ targetUserId, connection }) => {
      io.to(`user_${targetUserId}`).emit('receive_connection_request', connection)
    })

    socket.on('connection_updated', ({ targetUserId, connection }) => {
      io.to(`user_${targetUserId}`).emit('receive_connection_update', connection)
      io.to(`user_${connection.receiverId === targetUserId ? connection.requesterId : connection.receiverId}`).emit('receive_connection_update', connection)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`)
    })
  })

  console.log('⚡ [Socket.IO] Collaborative real-time handlers registered successfully!')
}

export function setupSocketServer(httpServer, allowedOrigin) {
  // Compatibility helper if invoked with httpServer directly
  if (!ioInstance && httpServer) {
    import('socket.io').then(({ Server }) => {
      const serverIo = new Server(httpServer, { cors: { origin: allowedOrigin || '*', credentials: true } })
      registerSocketHandlers(serverIo)
    })
  }
  return ioInstance
}

export function getSocketServer() {
  if (!ioInstance) {
    console.warn('⚠️ [Socket.IO] Attempted to get socket server before setup!')
  }
  return ioInstance
}
