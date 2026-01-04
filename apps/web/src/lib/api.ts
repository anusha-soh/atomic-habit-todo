/**
 * API Client for Backend Communication
 * Phase 2 Core Infrastructure
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include', // Include cookies for httpOnly JWT tokens
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
  register: (email: string, password: string) =>
    api.post('/api/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get('/api/auth/me'),
}
