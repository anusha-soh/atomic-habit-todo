export default function HabitsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-12">
        <div className="h-12 w-48 bg-notebook-paper-alt rounded animate-pulse mb-4" />
        <div className="h-6 w-96 bg-notebook-paper-alt rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-notebook-paper-alt border border-notebook-line rounded-xl h-64 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
