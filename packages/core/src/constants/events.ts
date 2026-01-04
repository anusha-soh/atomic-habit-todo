/**
 * Event Type Constants
 * Phase 2 Core Infrastructure
 */

/**
 * Authentication event types
 */
export const AuthEvents = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
} as const

export type AuthEventType = typeof AuthEvents[keyof typeof AuthEvents]

/**
 * All event types (union)
 */
export type EventType = AuthEventType
