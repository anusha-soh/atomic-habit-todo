/**
 * Shared Authentication Types
 * Phase 2 Core Infrastructure
 */

/**
 * User entity
 */
export interface User {
  id: string // UUID
  email: string
  created_at: string // ISO8601 datetime
}

/**
 * Session entity
 */
export interface Session {
  id: string // UUID
  expires_at: string // ISO8601 datetime
}

/**
 * User registration request payload
 */
export interface RegisterRequest {
  email: string
  password: string
}

/**
 * User login request payload
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Registration response
 */
export interface RegisterResponse {
  user: User
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User
  session: Session
}

/**
 * Logout response
 */
export interface LogoutResponse {
  message: string
}

/**
 * Current user response (/api/auth/me)
 */
export interface UserProfile {
  user: User
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string
}
