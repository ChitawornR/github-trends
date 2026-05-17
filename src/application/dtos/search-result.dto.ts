import type { RepositoryDto } from '@/src/application/dtos/repository.dto'
import type { OwnerDto } from '@/src/application/dtos/owner.dto'

/**
 * Discriminated union representing the three possible outcomes of a search.
 *
 * - `repo-detail`  — input was `owner/repo`; returns the single repository detail.
 * - `owner-repos`  — input matched a GitHub user/org; returns their profile + repos,
 *                    plus any other repositories whose name matches the query.
 * - `repo-list`    — fallback name search; returns a list of matching repositories.
 */
export type SearchResultDto =
  | RepoDetailSearchResultDto
  | OwnerReposSearchResultDto
  | RepoListSearchResultDto

export interface RepoDetailSearchResultDto {
  readonly kind: 'repo-detail'
  readonly repository: RepositoryDto
}

export interface OwnerReposSearchResultDto {
  readonly kind: 'owner-repos'
  readonly owner: OwnerDto
  readonly repositories: readonly RepositoryDto[]
  /** Repositories matching the query by name that are NOT owned by `owner`. */
  readonly nameMatches: readonly RepositoryDto[]
}

export interface RepoListSearchResultDto {
  readonly kind: 'repo-list'
  readonly repositories: readonly RepositoryDto[]
}
