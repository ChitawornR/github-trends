import type { RepositoryViewModel } from '@/src/presentation/view-models/repository.view-model'
import { RepositoryCard } from '@/src/presentation/components/repository/RepositoryCard'
import { StateMessage } from '@/src/presentation/components/common/StateMessage'

interface RepositoryListProps {
  repos: RepositoryViewModel[]
  emptyMessage?: string
  label?: string
}

export function RepositoryList({
  repos,
  emptyMessage = 'No repositories found.',
  label = 'Repositories',
}: RepositoryListProps) {
  if (repos.length === 0) {
    return <StateMessage variant="empty" message={emptyMessage} />
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label={label}
    >
      {repos.map((repo) => (
        <RepositoryCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}
