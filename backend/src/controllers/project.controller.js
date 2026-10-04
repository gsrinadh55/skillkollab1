import { getStore } from '../services/store.service.js'
import { createProjectSchema, updateProjectSchema, createTaskSchema, updateTaskStatusSchema, applyToProjectSchema } from '../validators/project.validator.js'
import { asyncHandler } from '../middlewares/async-handler.js'

export class ProjectController {
  static getProjects = asyncHandler(async (request, response) => {
    const { category, difficulty, search, ownerId } = request.query
    const store = getStore()
    const projects = await store.getProjects({ category, difficulty, search, ownerId })
    
    response.status(200).json({ status: 'success', count: projects.length, data: projects })
  })

  static getProjectById = asyncHandler(async (request, response) => {
    const store = getStore()
    const project = await store.getProjectById(request.params.id)

    if (!project) {
      return response.status(404).json({ status: 'error', message: 'Project not found with requested ID' })
    }

    const tasks = await store.getTasksByProjectId(project.id)
    response.status(200).json({ status: 'success', data: { ...project, tasks } })
  })

  static createProject = asyncHandler(async (request, response) => {
    const validatedData = createProjectSchema.parse(request.body)
    const ownerId = request.user ? request.user.id : 'demo-user-888'
    const ownerName = request.user ? request.user.name : 'DEMO BUILDER'

    const store = getStore()
    const newProject = await store.createProject({
      ...validatedData,
      ownerId,
      members: [{ userId: ownerId, role: 'OWNER', name: ownerName, title: 'Project Founder' }]
    })

    response.status(201).json({ status: 'success', message: 'Project initialized successfully!', data: newProject })
  })

  static updateProject = asyncHandler(async (request, response) => {
    const validatedData = updateProjectSchema.parse(request.body)
    const store = getStore()
    const updatedProject = await store.updateProject(request.params.id, validatedData)
    
    if (!updatedProject) {
      return response.status(404).json({ status: 'error', message: 'Project not found' })
    }

    response.status(200).json({ status: 'success', message: 'Project updated successfully!', data: updatedProject })
  })

  static getTasks = asyncHandler(async (request, response) => {
    const store = getStore()
    const tasks = await store.getTasksByProjectId(request.params.id)
    response.status(200).json({ status: 'success', count: tasks.length, data: tasks })
  })

  static createTask = asyncHandler(async (request, response) => {
    const validatedData = createTaskSchema.parse(request.body)
    const store = getStore()
    const newTask = await store.createTask({
      projectId: request.params.id,
      ...validatedData,
      assignee: request.user ? request.user.name : 'Team Contributor'
    })

    response.status(201).json({ status: 'success', message: 'Task created on Kanban board!', data: newTask })
  })

  static updateTaskStatus = asyncHandler(async (request, response) => {
    const { status, assigneeId } = updateTaskStatusSchema.parse(request.body)
    const store = getStore()
    const updatedTask = await store.updateTaskStatus(request.params.taskId, status, assigneeId || undefined)

    if (!updatedTask) {
      return response.status(404).json({ status: 'error', message: 'Task not found' })
    }

    response.status(200).json({ status: 'success', message: 'Task status updated!', data: updatedTask })
  })

  static applyToProject = asyncHandler(async (request, response) => {
    const validated = applyToProjectSchema.parse(request.body)
    response.status(200).json({
      status: 'success',
      message: `Your request to join as ${validated.role} has been sent to the team leads!`,
      application: { projectId: request.params.id, status: 'PENDING', ...validated }
    })
  })

  static getFiles = asyncHandler(async (request, response) => {
    const store = getStore()
    const files = await store.getProjectFiles(request.params.id)
    response.status(200).json({ status: 'success', data: files })
  })

  static createFile = asyncHandler(async (request, response) => {
    const store = getStore()
    const newFile = await store.createProjectFile({
      projectId: request.params.id,
      uploadedById: request.user ? request.user.id : 'demo-user-888',
      ...request.body
    })
    response.status(201).json({ status: 'success', data: newFile })
  })
}
