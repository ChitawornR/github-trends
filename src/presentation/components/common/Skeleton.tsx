interface SkeletonProps {
  className?: string
}

/** Single pulsing skeleton block. Compose multiples to build skeleton layouts. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[#2C2C2E] ${className}`}
    />
  )
}

/** A skeleton that mimics a repository card for loading states. */
export function RepositoryCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-3 rounded-2xl border border-[#2C2C2E] bg-[#1E1E1E] p-5"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

/** A skeleton grid of repository cards. */
export function RepositoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading repositories"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <RepositoryCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** A skeleton that mimics the language chart section. */
export function LanguagesSectionSkeleton() {
  return (
    <div aria-label="Loading languages" aria-busy="true" className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* chart placeholder */}
        <Skeleton className="h-64 w-full lg:w-80 rounded-xl" />
        {/* bar list placeholder */}
        <div className="flex-1 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
