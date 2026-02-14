import Link from 'next/link'
import { RegisterForm } from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-notebook-paper-alt">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-caveat text-notebook-ink">
            Create your account
          </h1>
          <p className="mt-2 text-sm font-inter text-notebook-ink-medium">
            Start building better habits today
          </p>
        </div>

        {/* Registration form card */}
        <div className="rounded-lg bg-notebook-paper-white p-8 shadow-notebook-md border border-notebook-line">
          <RegisterForm />
        </div>

        {/* Login link */}
        <p className="text-center text-sm font-inter text-notebook-ink-medium">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-patrick-hand text-notebook-ink-blue hover:text-notebook-ink-blue/80 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
