'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authAPI, APIError } from '@/lib/api'
import { useUser } from '@/contexts/user-context'

export function RegisterForm() {
  const router = useRouter()
  const { refetch } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Real-time validation states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // Email validation (real-time)
  const validateEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (value && !emailRegex.test(value)) {
      setEmailError('Invalid email format')
    } else {
      setEmailError('')
    }
  }

  // Password validation (real-time)
  const validatePassword = (value: string) => {
    if (value && value.length < 8) {
      setPasswordError('Password must be at least 8 characters')
    } else {
      setPasswordError('')
    }
    // Re-validate confirm password whenever password changes
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError('')
    }
  }

  // Confirm password validation (real-time)
  const validateConfirmPassword = (value: string) => {
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Final validation before submission
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }
    setConfirmPasswordError('')

    if (emailError || passwordError) {
      setError('Please fix validation errors before submitting')
      return
    }

    setLoading(true)

    try {
      // Call register API
      await authAPI.register(email, password)

      // Sync user context then navigate
      await refetch()
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof APIError) {
        // Handle specific error codes
        if (err.status === 409) {
          setError('Email already registered')
        } else if (err.status === 400) {
          setError(err.message || 'Invalid email or password')
        } else if (err.status === 429) {
          setError('Too many registration attempts. Please wait a few minutes and try again.')
        } else {
          setError('Registration failed. Please try again.')
        }
      } else {
        setError('Network error. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" aria-labelledby="register-title">
      {/* General error message */}
      {error && (
        <div
          className="bg-notebook-highlight-yellow p-4 rounded text-notebook-ink-red font-patrick-hand"
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
          onChange={(e) => {
            setEmail(e.target.value)
            validateEmail(e.target.value)
          }}
          onBlur={() => validateEmail(email)}
          disabled={loading}
          required
          aria-required="true"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-error" : undefined}
          className={emailError ? 'border-notebook-ink-red' : ''}
        />
        {emailError && (
          <p id="email-error" className="text-sm text-notebook-ink-red font-patrick-hand" role="alert">{emailError}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            validatePassword(e.target.value)
          }}
          onBlur={() => validatePassword(password)}
          disabled={loading}
          required
          aria-required="true"
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "password-error password-hint" : "password-hint"}
          className={passwordError ? 'border-notebook-ink-red' : ''}
        />
        {passwordError && (
          <p id="password-error" className="text-sm text-notebook-ink-red font-patrick-hand" role="alert">{passwordError}</p>
        )}
        <p id="password-hint" className="text-xs text-notebook-ink-light">
          Use at least 8 characters
        </p>
      </div>

      {/* Confirm Password field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            validateConfirmPassword(e.target.value)
          }}
          onBlur={() => validateConfirmPassword(confirmPassword)}
          disabled={loading}
          required
          aria-required="true"
          aria-invalid={!!confirmPasswordError}
          aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
          className={confirmPasswordError ? 'border-notebook-ink-red' : ''}
        />
        {confirmPasswordError && (
          <p id="confirm-password-error" className="text-sm text-notebook-ink-red font-patrick-hand" role="alert">{confirmPasswordError}</p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading || !!emailError || !!passwordError || !!confirmPasswordError}
        aria-busy={loading}
      >
        {loading ? 'Creating account...' : 'Register'}
      </Button>
    </form>
  )
}
