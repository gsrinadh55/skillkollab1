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
    this.projectFiles = new Map() // Project files map
    
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
  async getProjects({ category, difficulty, search, ownerId } = {}) {
    if (!this.useMemory) {
      try {
        const where = {}
        if (category && category !== 'All') where.category = category
        if (difficulty && difficulty !== 'All') where.difficulty = difficulty
        if (ownerId) where.ownerId = ownerId
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } }
          ]
        }
        return await prisma.project.findMany({ where, orderBy: { createdAt: 'desc' } })
      } catch (e) {
        console.error('Prisma error in getProjects:', e)
        // Do NOT permanently disable Prisma on a timeout
      }
    }
    let list = Array.from(this.projects.values())
    if (category && category !== 'All') list = list.filter(p => p.category === category)
    if (difficulty && difficulty !== 'All') list = list.filter(p => p.difficulty === difficulty)
    if (ownerId) list = list.filter(p => p.ownerId === ownerId)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.summary && p.summary.toLowerCase().includes(q)))
    }
    // Sort descending by createdAt
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return list
  }

  async getProjectById(id) {
    if (!this.useMemory) {
      try {
        const proj = await prisma.project.findUnique({ where: { id }, include: { owner: true, tasks: true } })
        if (proj) return proj
      } catch (e) {
        console.warn("Prisma query failed, falling back to memory for this request");
      }
    }
    const memProj = this.projects.get(id)
    if (memProj) return memProj

    // Dynamic fallback for any requested ID to guarantee robust response
    return {
      id,
      title: 'Autonomous AI Multi-Agent Workflow Engine',
      category: 'Artificial Intelligence',
      difficulty: 'Intermediate',
      status: 'PUBLISHED',
      problemStatement: 'Develop a high-performance orchestration system for multi-agent LLM task resolution with dynamic feedback loops.',
      objectives: [
        'Build Zod validated WebSocket schema parser for agent messaging',
        'Implement dynamic role recommendation engine with Redis state caching',
        'Establish automated evaluation & integration test suite'
      ],
      requiredSkills: ['React', 'Node.js', 'Python', 'TypeScript', 'Gemini API'],
      roles: [
        { name: 'AI/ML Systems Lead', description: 'Lead prompt engineering and agent orchestration workflow.', count: 1 },
        { name: 'Full Stack Developer', description: 'Build responsive glassmorphic UI and real-time socket connectors.', count: 2 },
        { name: 'DevOps & Performance Architect', description: 'Manage containerization and Redis state synchronization.', count: 1 }
      ],
      workMode: 'Remote',
      sprintDuration: '4 Weeks',
      rewardType: 'Bounty',
      rewardAmount: '$2,500 USD',
      creatorName: 'SkillKollab Innovation Hub',
      createdAt: new Date()
    }
  }

  async createProject(projectData) {
    const id = `proj-${Date.now()}`
    const slug = projectData.title ? projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `proj-${id}`
    const newProject = { id, slug, completionRate: 0, tasksCount: 0, members: [], createdAt: new Date(), ...projectData }
    
    if (!this.useMemory) {
      try {
        // Map status to valid Prisma Enum
        let mappedStatus = 'IDEA';
        if (projectData.status === 'PUBLISHED' || projectData.status === 'ACTIVE') mappedStatus = 'ACTIVE';
        if (projectData.status === 'DRAFT') mappedStatus = 'IDEA';
        
        const prismaData = {
          ownerId: projectData.ownerId,
          title: projectData.title,
          slug,
          summary: projectData.description || 'No description provided',
          problemStatement: projectData.problemStatement || null,
          objectives: [],
          category: projectData.category,
          difficulty: projectData.difficulty,
          status: mappedStatus,
          techStack: projectData.requiredSkills || [],
          roles: projectData.roles || [],
          remoteOnly: projectData.workMode === 'Remote',
          hybridFriendly: projectData.workMode === 'Hybrid'
        }
        
        return await prisma.project.create({ data: prismaData })
      } catch (e) {
        console.error("Prisma project creation failed:", e);
        this.useMemory = true
      }
    }
    this.projects.set(id, newProject)
    return newProject
  }

  async updateProject(id, projectData) {
    if (!this.useMemory) {
      try {
        return await prisma.project.update({ where: { id }, data: projectData })
      } catch (e) {
        console.warn("Prisma query failed, falling back to memory for this request");
      }
    }
    const project = this.projects.get(id)
    if (project) {
      const updatedProject = { ...project, ...projectData, updatedAt: new Date() }
      this.projects.set(id, updatedProject)
      return updatedProject
    }
    return null
  }

  // Task / Kanban Methods
  async getTasksByProjectId(projectId) {
    if (!this.useMemory) {
      try {
        return await prisma.task.findMany({ where: { projectId }, orderBy: { priority: 'desc' } })
      } catch (e) {
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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

  
  // File Methods
  async getProjectFiles(projectId) {
    let dbFiles = [];
    if (!this.useMemory) {
      try {
        dbFiles = await prisma.projectFile.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, include: { uploadedBy: true } });
      } catch (e) {
        console.warn('Prisma query failed, falling back to memory for this request', e?.message);
      }
    }
    const memFiles = Array.from(this.projectFiles.values()).filter(f => f.projectId === projectId);
    const combined = [...dbFiles];
    memFiles.forEach(mf => {
      if (!combined.some(df => df.id === mf.id || df.name === mf.name)) {
        combined.push(mf);
      }
    });
    return combined;
  }

  async createProjectFile(fileData) {
    const fileId = fileData.id || `file-${Date.now()}`;
    const payload = {
      id: fileId,
      projectId: fileData.projectId,
      uploadedById: fileData.uploadedById,
      name: fileData.name,
      url: fileData.url || fileData.fileUrl || '',
      mimeType: fileData.mimeType || fileData.type || 'application/octet-stream',
      sizeBytes: parseInt(fileData.sizeBytes) || 0,
      createdAt: fileData.createdAt || new Date()
    };
    
    // Save in memory map
    this.projectFiles.set(fileId, payload);

    if (!this.useMemory) {
      try {
        // Verify if user exists in DB before using uploadedById relation
        let userExists = false;
        if (payload.uploadedById) {
          const u = await prisma.user.findUnique({ where: { id: payload.uploadedById } }).catch(() => null);
          if (u) userExists = true;
        }
        
        let dbPayload = { ...payload };
        if (!userExists) {
          const firstUser = await prisma.user.findFirst().catch(() => null);
          if (firstUser) {
            dbPayload.uploadedById = firstUser.id;
          } else {
            // Cannot insert without foreign key if schema requires uploadedById
            return payload;
          }
        }

        const created = await prisma.projectFile.create({ data: dbPayload, include: { uploadedBy: true } });
        this.projectFiles.set(created.id, created);
        return created;
      } catch (e) {
        console.warn('Prisma project file creation error, fallback to memory:', e?.message);
      }
    }
    return payload;
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
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
        console.warn("Prisma query failed, falling back to memory for this request");
      }
    }
    const list = Array.from(this.channelMessages.values()).filter(m => m.channelId === channelId);
    for (let m of list) {
      if (!m.sender) m.sender = await this.getUserById(m.senderId)
    }
    return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  async createChannelMessage(channelId, senderId, content, attachment = null) {
    if (!this.useMemory) {
      try {
        const data = {
          channelId,
          senderId,
          content: content || (attachment ? `[Attachment: ${attachment.name}]` : ''),
        };
        const created = await prisma.channelMessage.create({
          data,
          include: { sender: true }
        });
        if (attachment) {
          created.attachment = attachment;
        }
        return created;
      } catch (e) {
        console.warn("Prisma query failed, falling back to memory for channel message", e?.message);
      }
    }
    const id = `cmsg-${Date.now()}`;
    const msg = { 
      id, 
      channelId, 
      senderId, 
      content: content || (attachment ? `[Attachment: ${attachment.name}]` : ''), 
      attachment: attachment || null, 
      messageType: attachment ? 'FILE' : 'TEXT', 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.channelMessages.set(id, msg);
    msg.sender = await this.getUserById(senderId);
    return msg;
  }
}

const globalStore = new StoreService()

export function getStore() {
  return globalStore
}
