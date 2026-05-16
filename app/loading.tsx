import { Container } from '@/src/presentation/components/layout/Container'
import { Skeleton, RepositoryListSkeleton, LanguagesSectionSkeleton } from '@/src/presentation/components/common/Skeleton'

export default function Loading() {
  return (
    <main className="flex-1">
      <Container className="py-8 space-y-12">
        {/* Search box skeleton */}
        <Skeleton className="h-11 w-full max-w-2xl" />

        {/* Languages section skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <LanguagesSectionSkeleton />
        </div>

        {/* Trending section skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-1 mb-6">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-26 rounded-md" />
          </div>
          <RepositoryListSkeleton count={6} />
        </div>

        {/* Top repos section skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-44" />
          <RepositoryListSkeleton count={6} />
        </div>
      </Container>
    </main>
  )
}
