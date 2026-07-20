// Full-page loading shown while the server streams the public page
export default function PublicLoading() {
  return (
    <div className="min-h-svh">
      {/* Hero skeleton */}
      <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-neutral-950 px-4">
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/20" />
        <div className="h-14 w-80 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-4 w-48 animate-pulse rounded-full bg-white/20" />
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 animate-pulse rounded-xl bg-white/10" />
              <div className="h-2.5 w-10 animate-pulse rounded-full bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
