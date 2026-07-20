export function GallerySkeleton() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Heading skeleton */}
        <div className="mb-4 h-3 w-20 animate-pulse rounded-full bg-primary/20" />
        <div className="mb-4 h-10 w-40 animate-pulse rounded-xl bg-muted" />
        <div className="mb-12 h-4 w-72 animate-pulse rounded-full bg-muted" />

        {/* Masonry placeholder */}
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {[180, 120, 200, 150, 140, 170, 130, 190, 160, 110, 175, 145].map((h, i) => (
            <div
              key={i}
              className="bg-muted mb-3 w-full animate-pulse break-inside-avoid rounded-xl"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
