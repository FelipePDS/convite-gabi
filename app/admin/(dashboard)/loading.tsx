// Admin page loading — shows inside the AdminShell (sidebar persists)
export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="h-4 w-64 rounded-full bg-muted" />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card border-border rounded-2xl border p-6">
            <div className="mb-3 h-3 w-24 rounded-full bg-muted" />
            <div className="h-9 w-16 rounded-xl bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-card border-border rounded-2xl border p-6 space-y-3">
        <div className="h-4 w-40 rounded-full bg-muted" />
        <div className="space-y-2 mt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  )
}
