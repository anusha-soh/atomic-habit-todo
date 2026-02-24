'use client'

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-notebook-paper flex items-center justify-center p-8">
      <div className="bg-notebook-paper-white border-2 border-notebook-ink rounded-lg p-8 max-w-md text-center shadow-notebook-md">
        <h2 className="font-caveat text-3xl text-notebook-ink mb-4">
          Something went wrong
        </h2>
        <p className="font-patrick-hand text-notebook-ink-light mb-6">
          {error.message || "Couldn't load your tasks. Please try again."}
        </p>
        <button
          onClick={reset}
          className="bg-notebook-ink text-notebook-paper px-6 py-2 rounded font-patrick-hand hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
