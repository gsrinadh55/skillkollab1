import { prisma } from '../config/db.js'

// Comprehensive In-Memory fallback store with seeded production-quality dummy data
class StoreService {
  constructor() {
    this.useMemory = false
    this.users = new Map()
    this.student_profiles = new Map()
    this.organization_profiles = new Map()
    this.projects = new Map()
    this.tasks = new Map()
    this.messages = new Map()
    this.conversations = new Map()
    this.channels = new Map()
    this.channelMessages = new Map()
    this.notifications = new Map()
    this.connections = new Map() // New connections map
    
    this.initSeedData()
  }

  initSeedData() {
    // Seed Users
    const defaultUsers = [
      { id: 'usr-1', name: 'Alex Rivera', email: 'alex@skillkollab.com', passwordHash: '$2a$10$demoHashPlaceholder', role: 'STUDENT', bio: 'Full-stack developer student at Stanford.', availabilityHrs: 15, createdAt: new Date() },
      { id: 'usr-2', name: 'Dr. Elena Rostova', email: 'elena@skillkollab.com', passwordHash: '$2a$10$demoHashPlaceholder', role: 'INNOVATION_LEAD', bio: 'AI researcher & senior system designer.', availabilityHrs: 8, createdAt: new Date() },
      { id: 'usr-3', name: 'Admin Master', email: 'admin@skillkollab.com', passwordHash: '$2a$10$demoHashPlaceholder', role: 'SUPER_ADMIN', bio: 'Platform telemetry moderator.', availabilityHrs: 40, createdAt: new Date() },
    ]
    defaultUsers.forEach(u => this.users.set(u.email, u))

    // Seed Projects
    const defaultProjects = [
      {
        id: 'proj-101',
        ownerId: 'usr-2',
        title: 'NexusAI - Autonomous Workflows for Designers',
        slug: 'nexus-ai',
        summary: 'Building a visual drag-and-drop workflow canvas powered by generative AI models to accelerate prototype generation for mobile UI teams.',
        problemStatement: 'Designers spend 40% of their time on repetitive wireframes before reaching custom interface solutions.',
        objectives: ['Implement React Flow canvas', 'Integrate LLM structured layout generator', 'Export directly to Figma JSON'],
        category: 'AI & ML Tools',
        difficulty: 'Advanced',
        status: 'ACTIVE',
        remoteOnly: true,
        hybridFriendly: false,
        techStack: ['React', 'TypeScript', 'Tailwind', 'Node.js', 'Python', 'OpenAI'],
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          { userId: 'usr-2', role: 'OWNER', name: 'Dr. Elena Rostova', title: 'AI Specialist' },
          { userId: 'usr-1', role: 'MEMBER', name: 'Alex Rivera', title: 'Frontend Engineer' }
        ],
        tasksCount: 6,
        completionRate: 68
      },
      {
        id: 'proj-102',
        ownerId: 'usr-1',
        title: 'OpenCode Platform - Student Peer Code Reviews',
        slug: 'opencode-platform',
        summary: 'A real-time collaborative IDE wrapper that connects computer science undergraduates with alumni mentors for weekly asynchronous live code feedback.',
        category: 'EdTech Solutions',
        difficulty: 'Intermediate',
        status: 'DISCOVERING',
        remoteOnly: true,
        hybridFriendly: true,
        techStack: ['Next.js', 'Socket.IO', 'Prisma', 'PostgreSQL', 'Docker'],
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          { userId: 'usr-1', role: 'OWNER', name: 'Alex Rivera', title: 'Founder & FullStack' }
        ],
        tasksCount: 4,
        completionRate: 35
      }
    ]
    defaultProjects.forEach(p => this.projects.set(p.id, p))

    // Seed Tasks for Proj-101 (Kanban demo)
    const initialTasks = [
      { id: 'tsk-1', projectId: 'proj-101', title: 'Define workflow AST syntax for AI prompt parsing', status: 'DONE', priority: 5, assignee: 'Dr. Elena Rostova' },
      { id: 'tsk-2', projectId: 'proj-101', title: 'Create draggable node components with ports', status: 'IN_PROGRESS', priority: 4, assignee: 'Alex Rivera' },
      { id: 'tsk-3', projectId: 'proj-101', title: 'Implement real-time canvas zoom and pan controls', status: 'IN_PROGRESS', priority: 3, assignee: 'Alex Rivera' },
      { id: 'tsk-4', projectId: 'proj-101', title: 'Setup WebSocket room syncing for team collaboration', status: 'TODO', priority: 4, assignee: 'Unassigned' },
      { id: 'tsk-5', projectId: 'proj-101', title: 'Optimize OpenAI embedding latency for suggestion tooltips', status: 'REVIEW', priority: 5, assignee: 'Dr. Elena Rostova' },
      { id: 'tsk-6', projectId: 'proj-101', title: 'Export JSON schematic to Figma Plugin conversion API', status: 'TODO', priority: 3, assignee: 'Unassigned' },
    ]
    initialTasks.forEach(t => this.tasks.set(t.id, t))

    // Seed mock connections for usr-1
    const initialConnections = [
      { id: 'conn-1', requesterId: 'usr-2', receiverId: 'usr-1', status: 'PENDING', createdAt: new Date(), updatedAt: new Date() },
    ]
    initialConnections.forEach(c => this.connections.set(c.id, c))
  }

  async checkDatabaseAvailability() {
    try {
      await prisma.$queryRaw`SELECT 1`
      this.useMemory = false
      return true
    } catch (err) {
      this.useMemory = true
      return false
    }
  }

  // User Methods
  async getUserByEmail(email) {
    if (!this.useMemory) {
      try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
        if (user) return user
      } catch (e) {
        this.useMemory = true
      }
    }
    return this.users.get(email.toLowerCase()) || null
  }

  async getUserById(id) {
    if (!this.useMemory) {
      try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (user) return user
      } catch (e) {
        this.useMemory = true
      }
    }
    for (const user of this.users.values()) {
      if (user.id === id) return user
    }
    return null
  }

  async createUser(userData) {
    const { profile, ...baseUser } = userData
    const email = baseUser.email.toLowerCase()
    
    if (!this.useMemory) {
      try {
        // Here you would normally use a Prisma transaction to save both user and profile
        // For fallback, we will just simulate it
        const dbUser = await prisma.user.create({
          data: { ...baseUser, email },
        })
        return dbUser
      } catch (e) {
        this.useMemory = true
      }
    }
    
    const newUser = { id: `usr-${Date.now()}`, ...baseUser, email, createdAt: new Date() }
    this.users.set(email, newUser)
    
    if (profile) {
      const profileRecord = { userId: newUser.id, ...profile }
      if (newUser.role === 'ORGANIZATION_ADMIN' || newUser.role === 'ORGANIZATION_REVIEWER') {
        this.organization_profiles.set(newUser.id, profileRecord)
      } else {
        this.student_profiles.set(newUser.id, profileRecord)
      }
    }
    
    return newUser
  }

  async updateUser(id, data) {
    if (!this.useMemory) {
      try {
        return await prisma.user.update({ where: { id }, data })
      } catch (e) {
        this.useMemory = true
      }
    }
    const user = await this.getUserById(id)
    if (user) {
      const updated = { ...user, ...data, updatedAt: new Date() }
      this.users.set(user.email, updated)
      return updated
    }
    return null
  }

  // Project Methods
  async getProjects({ category, difficulty, search } = {}) {
    if (!this.useMemory) {
      try {
        const where = {}
        if (category && category !== 'All') where.category = category
        if (difficulty && difficulty !== 'All') where.difficulty = difficulty
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } }
          ]
        }
        return await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } })
      } catch (e) {
        this.useMemory = true
      }
    }
    let list = Array.from(this.projects.values())
    if (category && category !== 'All') list = list.filter(p => p.category === category)
    if (difficulty && difficulty !== 'All') list = list.filter(p => p.difficulty === difficulty)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))
    }
    return list
  }

  async getProjectById(id) {
    if (!this.useMemory) {
      try {
        const proj = await prisma.project.findUnique({ where: { id }, include: { owner: true, tasks: true } })
        if (proj) return proj
      } catch (e) {
        this.useMemory = true
      }
    }
    return this.projects.get(id) || null
  }

  async createProject(projectData) {
    const id = `proj-${Date.now()}`
    const slug = projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const newProject = { id, slug, status: 'ACTIVE', completionRate: 0, tasksCount: 0, members: [], createdAt: new Date(), ...projectData }
    
    if (!this.useMemory) {
      try {
        return await prisma.project.create({ data: newProject })
      } catch (e) {
        this.useMemory = true
      }
    }
    this.projects.set(id, newProject)
    return newProject
  }

  // Task / Kanban Methods
  async getTasksByProjectId(projectId) {
    if (!this.useMemory) {
      try {
        return await prisma.task.findMany({ where: { projectId }, orderBy: { priority: 'desc' } })
      } catch (e) {
        this.useMemory = true
      }
    }
    return Array.from(this.tasks.values()).filter(t => t.projectId === projectId)
  }

  async createTask(taskData) {
    const id = `tsk-${Date.now()}`
    const newTask = { id, createdAt: new Date(), ...taskData }
    if (!this.useMemory) {
      try {
        return await prisma.task.create({ data: newTask })
      } catch (e) {
        this.useMemory = true
      }
    }
    this.tasks.set(id, newTask)
    return newTask
  }

  async updateTaskStatus(taskId, status, assignee) {
    if (!this.useMemory) {
      try {
        return await prisma.task.update({ where: { id: taskId }, data: { status, assignee } })
      } catch (e) {
        this.useMemory = true
      }
    }
    const t = this.tasks.get(taskId)
    if (t) {
      t.status = status
      if (assignee !== undefined) t.assignee = assignee
      this.tasks.set(taskId, t)
      return t
    }
    return null
  }

  // Connection Methods
  async getConnectionsByUser(userId) {
    if (!this.useMemory) {
      try {
        return await prisma.connection.findMany({
          where: {
            OR: [{ requesterId: userId }, { receiverId: userId }]
          },
          include: { requester: true, receiver: true }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    const list = Array.from(this.connections.values()).filter(c => c.requesterId === userId || c.receiverId === userId)
    // Populate user info for mock
    for (let c of list) {
      if (!c.requester) c.requester = await this.getUserById(c.requesterId)
      if (!c.receiver) c.receiver = await this.getUserById(c.receiverId)
    }
    return list
  }

  async getConnection(userId1, userId2) {
    if (!this.useMemory) {
      try {
        return await prisma.connection.findFirst({
          where: {
            OR: [
              { requesterId: userId1, receiverId: userId2 },
              { requesterId: userId2, receiverId: userId1 }
            ]
          }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    return Array.from(this.connections.values()).find(c => 
      (c.requesterId === userId1 && c.receiverId === userId2) || 
      (c.requesterId === userId2 && c.receiverId === userId1)
    ) || null
  }

  async createConnection(requesterId, receiverId) {
    if (!this.useMemory) {
      try {
        return await prisma.connection.create({
          data: { requesterId, receiverId, status: 'PENDING' }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    const id = `conn-${Date.now()}`
    const conn = { id, requesterId, receiverId, status: 'PENDING', createdAt: new Date(), updatedAt: new Date() }
    this.connections.set(id, conn)
    return conn
  }

  async updateConnectionStatus(id, status) {
    if (!this.useMemory) {
      try {
        return await prisma.connection.update({
          where: { id },
          data: { status }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    const conn = this.connections.get(id)
    if (conn) {
      conn.status = status
      conn.updatedAt = new Date()
      this.connections.set(id, conn)
      return conn
    }
    return null
  }

  // Direct Message Methods (Discord-Style)
  async getOrCreateConversation(userId1, userId2) {
    if (!this.useMemory) {
      try {
        // Find existing conversation between these two
        let conv = await prisma.conversation.findFirst({
          where: {
            type: 'DIRECT',
            AND: [
              { members: { some: { userId: userId1 } } },
              { members: { some: { userId: userId2 } } }
            ]
          },
          include: { members: true }
        });
        
        if (!conv) {
          conv = await prisma.conversation.create({
            data: {
              type: 'DIRECT',
              createdById: userId1,
              members: {
                create: [
                  { userId: userId1 },
                  { userId: userId2 }
                ]
              }
            },
            include: { members: true }
          });
        }
        return conv;
      } catch (e) {
        this.useMemory = true;
      }
    }
    
    // Memory fallback
    let existingConv = Array.from(this.conversations.values()).find(c => 
      c.type === 'DIRECT' && 
      c.members.includes(userId1) && 
      c.members.includes(userId2)
    );
    if (!existingConv) {
      existingConv = {
        id: `conv-${Date.now()}`,
        type: 'DIRECT',
        createdById: userId1,
        members: [userId1, userId2],
        createdAt: new Date()
      };
      this.conversations.set(existingConv.id, existingConv);
    }
    return existingConv;
  }

  async getDirectMessages(conversationId) {
    if (!this.useMemory) {
      try {
        return await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          include: { sender: true }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    const list = Array.from(this.messages.values()).filter(m => m.conversationId === conversationId);
    for (let m of list) {
      if (!m.sender) m.sender = await this.getUserById(m.senderId)
    }
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  async createDirectMessage(conversationId, senderId, content) {
    if (!this.useMemory) {
      try {
        return await prisma.message.create({
          data: {
            conversationId,
            senderId,
            content
          },
          include: { sender: true }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    const id = `msg-${Date.now()}`
    const msg = { id, conversationId, senderId, content, messageType: 'TEXT', createdAt: new Date(), updatedAt: new Date() }
    this.messages.set(id, msg)
    msg.sender = await this.getUserById(senderId)
    return msg
  }

  // Channel Methods
  async getChannels(projectId) {
    if (!this.useMemory) {
      try {
        return await prisma.channel.findMany({
          where: { projectId },
          orderBy: { createdAt: 'asc' }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    return Array.from(this.channels.values()).filter(c => c.projectId === projectId);
  }

  async getChannelMessages(channelId) {
    if (!this.useMemory) {
      try {
        return await prisma.channelMessage.findMany({
          where: { channelId },
          orderBy: { createdAt: 'asc' },
          include: { sender: true }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    const list = Array.from(this.channelMessages.values()).filter(m => m.channelId === channelId);
    for (let m of list) {
      if (!m.sender) m.sender = await this.getUserById(m.senderId)
    }
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  async createChannelMessage(channelId, senderId, content) {
    if (!this.useMemory) {
      try {
        return await prisma.channelMessage.create({
          data: {
            channelId,
            senderId,
            content
          },
          include: { sender: true }
        })
      } catch (e) {
        this.useMemory = true
      }
    }
    const id = `cmsg-${Date.now()}`
    const msg = { id, channelId, senderId, content, messageType: 'TEXT', createdAt: new Date(), updatedAt: new Date() }
    this.channelMessages.set(id, msg)
    msg.sender = await this.getUserById(senderId)
    return msg
  }
}

const globalStore = new StoreService()

export function getStore() {
  return globalStore
}
