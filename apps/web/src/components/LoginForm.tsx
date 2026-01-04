'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authAPI, APIError } from '@/lib/api'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      // Call login API
      await authAPI.login(email, password)

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof APIError) {
        // Handle specific error codes
        if (err.status === 401) {
          setError('Invalid email or password')
        } else {
          setError('Login failed. Please try again.')
        }
      } else {
        setError('Network error. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" aria-labelledby="login-title">
      {/* General error message */}
      {error && (
        <div
          className="rounded-md bg-red-50 p-4 text-sm text-red-800"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          aria-required="true"
        />
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          aria-required="true"
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
