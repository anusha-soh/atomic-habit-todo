import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-notebook-paper-alt">
      <main className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-5xl font-caveat text-notebook-ink">Atomic Habits</h1>
        <p className="text-lg font-inter text-notebook-ink-medium">
          Build better habits, one day at a time.
        </p>
        <div className="flex flex-col gap-4 pt-8">
          <Link
            href="/register"
            className="rounded-lg bg-notebook-ink-blue px-6 py-3 font-patrick-hand text-notebook-paper-white shadow-notebook-sm hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200 touch-target"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="rounded-lg border-2 border-notebook-ink-blue px-6 py-3 font-patrick-hand text-notebook-ink-blue hover:bg-notebook-paper-alt/50 shadow-notebook-sm hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200 touch-target"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  )
}
