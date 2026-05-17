import type { RepositoryViewModel } from '@/src/presentation/view-models/repository.view-model'
import type { OwnerViewModel } from '@/src/presentation/view-models/owner.view-model'
import { RepositoryList } from '@/src/presentation/components/repository/RepositoryList'
import { RepositoryDetail } from '@/src/presentation/components/repository/RepositoryDetail'

interface SearchResultsProps {
  kind: 'repo-detail' | 'owner-repos' | 'repo-list'
  repoViewModels: RepositoryViewModel[]
  ownerViewModel?: OwnerViewModel
  repoViewModel?: RepositoryViewModel
  nameMatchViewModels?: RepositoryViewModel[]
}

export function SearchResults({
  kind,
  repoViewModels,
  ownerViewModel,
  repoViewModel,
  nameMatchViewModels = [],
}: SearchResultsProps) {
  if (kind === 'repo-detail' && repoViewModel) {
    return (
      <div>
        <p className="mb-4 text-sm text-[#98989D]">Showing repository detail</p>
        <RepositoryDetail repo={repoViewModel} />
      </div>
    )
  }

  if (kind === 'owner-repos' && ownerViewModel) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4 rounded-2xl border border-[#2C2C2E] bg-[#1E1E1E] p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ownerViewModel.avatarUrl}
            alt={`${ownerViewModel.login} avatar`}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full border border-[#2C2C2E] object-cover"
            loading="lazy"
          />
          <div>
            <div className="flex items-center gap-2">
              <a
                href={ownerViewModel.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-white hover:text-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-sm"
              >
                {ownerViewModel.name ?? ownerViewModel.login}
              </a>
              <span className="rounded-full bg-[#2C2C2E] px-2 py-0.5 text-xs text-[#98989D]">
                {ownerViewModel.type}
              </span>
            </div>
            <p className="text-sm text-[#98989D]">@{ownerViewModel.login}</p>
            {ownerViewModel.bio && (
              <p className="mt-1 text-sm text-[#98989D]">{ownerViewModel.bio}</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-base font-semibold text-white">
            Repositories ({repoViewModels.length})
          </h2>
          <RepositoryList
            repos={repoViewModels}
            label={`Repositories by ${ownerViewModel.login}`}
            emptyMessage="This user has no public repositories."
          />
        </div>

        {nameMatchViewModels.length > 0 && (
          <div>
            <h2 className="mb-4 text-base font-semibold text-white">
              Repositories named &ldquo;{ownerViewModel.login}&rdquo; ({nameMatchViewModels.length})
            </h2>
            <RepositoryList
              repos={nameMatchViewModels}
              label={`Repositories named ${ownerViewModel.login}`}
              emptyMessage="No repositories matched this name."
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[#98989D]">
        {repoViewModels.length} {repoViewModels.length === 1 ? 'repository' : 'repositories'} found
      </p>
      <RepositoryList
        repos={repoViewModels}
        label="Search results"
        emptyMessage="No repositories matched your search."
      />
    </div>
  )
}
