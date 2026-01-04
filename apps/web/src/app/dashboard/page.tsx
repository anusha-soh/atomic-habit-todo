'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, APIError } from '@/lib/api'
import { LogoutButton } from '@/components/LogoutButton'

interface User {
  id: string
  email: string
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch current user on mount
    const fetchUser = async () => {
      try {
        const response = await authAPI.me()
        setUser(response.user)
      } catch (err) {
        if (err instanceof APIError && err.status === 401) {
          // Not authenticated - redirect to login
          router.push('/login')
        } else {
          setError('Failed to load user data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirecting...
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Account created:</strong>{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              ✅ Phase 2 Core Infrastructure is working! You're successfully
              authenticated.
            </p>
          </div>
        </div>

        {/* Placeholder for future features */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Tasks</h3>
            <p className="mt-2 text-sm text-gray-600">
              Coming in Phase 2 Chunk 2...
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900">Habits</h3>
            <p className="mt-2 text-sm text-gray-600">
              Coming in Phase 2 Chunk 3...
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
