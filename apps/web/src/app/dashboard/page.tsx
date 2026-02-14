'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fetch current user on mount
    const fetchUser = async () => {
      try {
        const response = await authAPI.me() as { user: User }
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-notebook-ink-blue border-r-transparent"></div>
          <p className="mt-4 text-notebook-ink-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-notebook-highlight-pink/50 text-notebook-ink-red font-patrick-hand rounded-lg p-4">
          {error}
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirecting...
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Main content */}
      <div className="rounded-lg bg-notebook-paper-white p-6 shadow-notebook-md border border-notebook-line">
        <h2 className="font-caveat text-3xl text-notebook-ink mb-4">Welcome!</h2>
        <div className="space-y-2 text-notebook-ink-medium font-inter">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Account created:</strong>{' '}
            {mounted ? new Date(user.created_at).toLocaleDateString() : 'Loading...'}
          </p>
          <p className="mt-4 text-sm text-notebook-ink-green font-medium">
            ✅ You're successfully authenticated.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Link href="/tasks" className="block group rounded-lg border border-notebook-line bg-notebook-paper-white p-6 shadow-notebook-sm hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200">
            <h3 className="font-patrick-hand text-notebook-ink group-hover:text-notebook-ink-blue flex items-center gap-2">
              <span>📋</span> Manage Tasks
            </h3>
            <p className="mt-2 text-sm text-notebook-ink-medium font-inter">
              View, create, and organize your daily to-do list.
            </p>
          </Link>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Link href="/habits" className="block group rounded-lg border border-notebook-line bg-notebook-paper-white p-6 shadow-notebook-sm hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200">
            <h3 className="font-patrick-hand text-notebook-ink group-hover:text-notebook-ink-blue flex items-center gap-2">
              <span>📈</span> Habits
            </h3>
            <p className="mt-2 text-sm text-notebook-ink-medium font-inter">
              Track and build your daily habits.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
