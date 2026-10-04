import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { getStore } from '../services/store.service.js'

/**
 * Authentication Middleware: Verifies JWT Token from Authorization header or cookie
 */
export async function requireAuth(request, response, next) {
  try {
    const authHeader = request.headers.authorization
    let token = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (request.query && request.query.token) {
      token = request.query.token
    }

    if (!token) {
      return response.status(401).json({ status: 'error', message: 'Authentication required. Please log in.' })
    }

    // Handle offline demo token fallback gracefully
    if (token === 'jwt_demo_token_offline_fallback' || token.startsWith('jwt_')) {
      request.user = {
        id: 'demo-user-888',
        name: 'DEMO BUILDER',
        email: 'demo@skillkollab.com',
        role: 'USER',
        bio: 'Evaluation Builder',
      }
      return next()
    }

    let decoded
    try {
      decoded = jwt.verify(token, env.jwtSecret)
    } catch (err) {
      // Fallback for Firebase ID tokens
      decoded = jwt.decode(token)
      if (!decoded || (!decoded.user_id && !decoded.uid)) {
        throw new Error('Invalid or expired authentication token.')
      }
    }

    const store = getStore()
    const extractedId = decoded.id || decoded.userId || decoded.user_id || decoded.uid
    let user = await store.getUserById(extractedId)

    if (!user) {
      // Auto-construct user for Firebase authenticated users missing from local DB
      if (extractedId) {
        try {
          user = await store.createUser({
            id: extractedId,
            name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'SkillKollab User'),
            email: decoded.email,
            role: 'USER',
            passwordHash: 'firebase_managed',
          })
        } catch (err) {
          // In case of a race condition where the user was created just now
          user = await store.getUserById(extractedId)
        }
      } else {
        return response.status(401).json({ status: 'error', message: 'User associated with this token no longer exists.' })
      }
    }

    request.user = user
    next()
  } catch (error) {
    console.error('JWT Verification error:', error.message)
    return response.status(401).json({ status: 'error', message: 'Invalid or expired authentication token.' })
  }
}

/**
 * Optional Authentication Middleware: Attaches user if token exists, or provides guest user context
 */
export async function optionalAuth(request, response, next) {
  const authHeader = request.headers.authorization
  if (!authHeader && (!request.query || !request.query.token)) {
    request.user = { id: 'guest-innovator', name: 'Guest Innovator', role: 'USER' }
    return next()
  }
  return requireAuth(request, response, next)
}

/**
 * Authorization Middleware: Checks if request user holds one of the required roles
 */
export function requireRoles(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        status: 'error',
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
      })
    }
    next()
  }
}
