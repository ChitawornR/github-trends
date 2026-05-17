import type { SearchResultDto } from '@/src/application/dtos/search-result.dto'
import type { RepositoryViewModel } from '@/src/presentation/view-models/repository.view-model'
import type { OwnerViewModel } from '@/src/presentation/view-models/owner.view-model'
import { RepositoryList } from '@/src/presentation/components/repository/RepositoryList'
import { RepositoryDetail } from '@/src/presentation/components/repository/RepositoryDetail'

interface SearchResultsProps {
  result: SearchResultDto
  /** Pre-mapped view models for the repositories */
  repoViewModels: RepositoryViewModel[]
  /** Pre-mapped owner view model (only for owner-repos kind) */
  ownerViewModel?: OwnerViewModel
  /** Pre-mapped single repo view model (only for repo-detail kind) */
  repoViewModel?: RepositoryViewModel
  /** Repos matching the query by name, not owned by the matched owner (owner-repos kind) */
  nameMatchViewModels?: RepositoryViewModel[]
}

export function SearchResults({
  result,
  repoViewModels,
  ownerViewModel,
  repoViewModel,
  nameMatchViewModels = [],
}: SearchResultsProps) {
  if (result.kind === 'repo-detail' && repoViewModel) {
    return (
      <div>
        <p className="mb-4 text-sm text-[#98989D]">Showing repository detail</p>
        <RepositoryDetail repo={repoViewModel} />
      </div>
    )
  }

  if (result.kind === 'owner-repos' && ownerViewModel) {
    return (
      <div className="space-y-6">
        {/* Owner profile card */}
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

        {/* Their repositories */}
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

        {/* Other repos that match the query by name */}
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

  // repo-list kind
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
