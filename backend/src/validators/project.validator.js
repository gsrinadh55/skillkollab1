import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string().min(5, 'Project title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').optional(),
  problemStatement: z.string().min(30, 'Problem statement must be at least 30 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  minTeamSize: z.number().min(1).max(50).optional(),
  maxTeamSize: z.number().min(1).max(50).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  workMode: z.string().optional(),
  rewardType: z.string().optional(),
  rewardAmount: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  roles: z.array(z.object({
    name: z.string().min(1, 'Role name is required'),
    count: z.number().min(1),
    skills: z.array(z.string()).optional(),
    description: z.string().optional()
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
