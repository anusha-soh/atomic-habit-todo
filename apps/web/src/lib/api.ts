/**
 * API Client for Backend Communication
 * Phase 2 Core Infrastructure
 */

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '')

const API_URL = API_BASE

/**
 * Token storage for cross-origin auth (Bearer token fallback).
 * Cookies are blocked as third-party when frontend and backend
 * are on different domains (e.g. vercel.app → hf.space).
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

interface FetchOptions extends RequestInit {
  data?: any
}

/**
 * Fetch wrapper with automatic error handling and JSON parsing
 */
async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { data, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Add Bearer token if available (cross-origin fallback)
  const token = getStoredToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: 'include', // Also send cookies when same-origin
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, config)

    // Parse JSON response
    let responseData: any
    try {
      responseData = await response.json()
    } catch {
      responseData = null
    }

    // Handle errors
    if (!response.ok) {
      throw new APIError(
        responseData?.error || responseData?.detail || 'Request failed',
        response.status,
        responseData
      )
    }

    return responseData as T
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    // Network error or other fetch failure
    throw new APIError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

/**
 * API client object with typed methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', data }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', data }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
}

/**
 * Authentication API methods
 */
export const authAPI = {
  register: async (email: string, password: string) => {
    const result = await api.post<{ user: any; token?: string }>('/api/auth/register', { email, password })
    if (result.token) setStoredToken(result.token)
    return result
  },

  login: async (email: string, password: string) => {
    const result = await api.post<{ user: any; session: any; token?: string }>('/api/auth/login', { email, password })
    if (result.token) setStoredToken(result.token)
    return result
  },

  logout: async () => {
    const result = await api.post('/api/auth/logout')
    setStoredToken(null)
    return result
  },

  me: () => api.get('/api/auth/me'),
}
