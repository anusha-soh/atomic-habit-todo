import Link from 'next/link'
import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-notebook-paper-alt">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-caveat text-notebook-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm font-inter text-notebook-ink-medium">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login form card */}
        <div className="rounded-lg bg-notebook-paper-white p-8 shadow-notebook-md border border-notebook-line">
          <LoginForm />
        </div>

        {/* Register link */}
        <p className="text-center text-sm font-inter text-notebook-ink-medium">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-patrick-hand text-notebook-ink-blue hover:text-notebook-ink-blue/80 hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  )
}
