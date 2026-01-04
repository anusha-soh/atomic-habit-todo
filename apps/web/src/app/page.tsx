import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold">Atomic Habits</h1>
        <p className="text-lg text-gray-600">
          Phase 2 Core Infrastructure - Authentication
        </p>
        <div className="flex flex-col gap-4 pt-8">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 touch-target"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50 touch-target"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  )
}
