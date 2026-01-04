'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authAPI, APIError } from '@/lib/api'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      // Call logout API
      await authAPI.logout()

      // Redirect to login page
      router.push('/login')
    } catch (err) {
      // Even if logout API fails, redirect to login
      // (idempotent - the goal is to get user to login page)
      console.error('Logout error:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={loading}
      className="touch-target"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}
