import Link from 'next/link'
import { RegisterForm } from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Start building better habits today
          </p>
        </div>

        {/* Registration form card */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <RegisterForm />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
