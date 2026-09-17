import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100).optional(),
  email: z.string().email('Please provide a valid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(100),
  role: z.enum(['USER', 'ORGANIZATION', 'ADMIN']).default('USER'),
})

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
})

export const onboardingSchema = z.object({
  intent: z.string().min(3, 'Please describe what you want to build'),
  interests: z.array(z.string()).min(1, 'Select at least one area of interest'),
  skillsToLearn: z.array(z.string()).optional(),
  weeklyHours: z.number().min(1).max(168).default(10),
  experienceLevel: z.string().optional(),
})
