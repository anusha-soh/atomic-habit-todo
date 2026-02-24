export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-10 w-64 bg-notebook-paper-alt rounded animate-pulse mb-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-notebook-paper-alt border border-notebook-line rounded-xl h-48 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
