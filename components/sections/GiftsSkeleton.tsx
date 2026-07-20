export function GiftsSkeleton() {
  return (
    <section className="bg-muted/30 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Heading skeleton */}
        <div className="mb-4 h-3 w-24 animate-pulse rounded-full bg-primary/20" />
        <div className="mb-6 h-10 w-56 animate-pulse rounded-xl bg-muted" />
        <div className="mb-12 h-4 w-80 animate-pulse rounded-full bg-muted" />

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border-border overflow-hidden rounded-2xl border">
              <div className="bg-muted aspect-square animate-pulse" />
              <div className="space-y-2 p-4">
                <div className="bg-muted h-4 w-3/4 animate-pulse rounded-full" />
                <div className="bg-muted h-3 w-full animate-pulse rounded-full" />
                <div className="bg-muted mt-4 h-8 w-full animate-pulse rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
