import { Router } from 'express'
import { ProjectController } from '../controllers/project.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const projectRouter = Router()

// Public & Protected Project Discovery endpoints
projectRouter.get('/', ProjectController.getProjects)
projectRouter.get('/:id', ProjectController.getProjectById)
projectRouter.post('/', requireAuth, ProjectController.createProject)
projectRouter.put('/:id', requireAuth, ProjectController.updateProject)
projectRouter.post('/:id/apply', requireAuth, ProjectController.applyToProject)

// Workspace Kanban Tasks & Sprint Endpoints
projectRouter.get('/:id/tasks', ProjectController.getTasks)
projectRouter.post('/:id/tasks', requireAuth, ProjectController.createTask)
projectRouter.patch('/tasks/:taskId', requireAuth, ProjectController.updateTaskStatus)

// Workspace Files Endpoints
projectRouter.get('/:id/files', ProjectController.getFiles)
projectRouter.post('/:id/files', requireAuth, ProjectController.createFile)

export default projectRouter
