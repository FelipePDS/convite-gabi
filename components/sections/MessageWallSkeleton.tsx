export function MessageWallSkeleton() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-4 h-3 w-20 animate-pulse rounded-full bg-primary/20" />
        <div className="mb-4 h-10 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="mb-12 h-4 w-72 animate-pulse rounded-full bg-muted" />

        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
          {[120, 90, 140, 100, 110, 130].map((h, i) => (
            <div
              key={i}
              className="bg-muted mb-3 w-full animate-pulse break-inside-avoid rounded-2xl"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
