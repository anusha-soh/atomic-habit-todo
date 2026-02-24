'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '@/lib/api'

interface User {
  id: string
  email: string
  created_at: string
}

interface UserContextValue {
  user: User | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await authAPI.me() as { user: User }
      setUser(data.user)
      setError(null)
    } catch {
      setUser(null)
      setError('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  return (
    <UserContext.Provider value={{ user, isLoading, error, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
