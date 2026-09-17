import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters').max(120),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(500),
  problemStatement: z.string().optional(),
  objectives: z.array(z.string()).default([]),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Beginner Friendly', 'Intermediate', 'Advanced']).default('Intermediate'),
  remoteOnly: z.boolean().default(true),
  hybridFriendly: z.boolean().default(false),
  techStack: z.array(z.string()).default([]),
  requiredRoles: z.array(z.string()).optional(),
  teamSize: z.number().min(2).max(10).optional(),
  recommendationAccepted: z.boolean().optional(),
  roles: z.array(z.object({
    role: z.string(),
    count: z.number().min(1),
    skills: z.array(z.string()).optional()
  })).optional()
})

export const updateProjectSchema = createProjectSchema.partial()

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE']).default('TODO'),
  priority: z.number().int().min(1).max(5).default(3),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
})

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE']),
  assigneeId: z.string().optional().nullable(),
})

export const applyToProjectSchema = z.object({
  role: z.string().min(2, 'Requested role required'),
  message: z.string().max(400).optional(),
})
