import Link from 'next/link'
import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login form card */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <LoginForm />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  )
}
