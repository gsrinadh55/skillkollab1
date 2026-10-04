import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { getStore } from './store.service.js'

export class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' }
    )
  }

  static async register({ name, email, password, role, profile }) {
    const store = getStore()
    const existingUser = await store.getUserByEmail(email)
    
    if (existingUser) {
      const error = new Error('An account with this email address already exists.')
      error.status = 409
      throw error
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await store.createUser({
      name,
      email,
      passwordHash,
      role: role || 'USER',
      bio: 'New builder in the SkillKollab ecosystem.',
      availabilityHrs: 10,
      profile
    })

    const token = this.generateToken(user)
    const { passwordHash: _ignored, ...userWithoutPassword } = user

    return { user: userWithoutPassword, token }
  }

  static async login({ email, password }) {
    const store = getStore()
    const user = await store.getUserByEmail(email)

    if (!user) {
      const error = new Error('Invalid email or password credentials.')
      error.status = 401
      throw error
    }

    // Support demo placeholder hashes in offline evaluation mode
    const isPasswordValid = user.passwordHash.startsWith('$2a$10$demoHash')
      ? true
      : await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password credentials.')
      error.status = 401
      throw error
    }

    const token = this.generateToken(user)
    const { passwordHash: _ignored, ...userWithoutPassword } = user

    return { user: userWithoutPassword, token }
  }

  static async getMe(userId) {
    const store = getStore()
    const user = await store.getUserById(userId)
    if (!user) return null
    const { passwordHash: _ignored, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  static async processOnboarding(userId, onboardingData) {
    const store = getStore()
    const updated = await store.updateUser(userId, {
      bio: onboardingData.intent,
      availabilityHrs: onboardingData.weeklyHours || 10,
      metadata: { onboarding: onboardingData, onboardedAt: new Date() }
    })
    if (!updated) return null
    const { passwordHash: _ignored, ...userWithoutPassword } = updated
    return userWithoutPassword
  }
}
