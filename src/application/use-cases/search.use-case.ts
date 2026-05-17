import type { IGithubRepository } from '@/src/domain/repositories/github.repository'
import type { Result } from '@/src/application/result'
import type { SearchResultDto } from '@/src/application/dtos/search-result.dto'
import { ok, err } from '@/src/application/result'
import { InvalidInputError } from '@/src/application/errors/invalid-input.error'
import { NotFoundError } from '@/src/application/errors/not-found.error'
import { RateLimitError } from '@/src/application/errors/rate-limit.error'
import { InternalError } from '@/src/application/errors/internal.error'
import { toRepositoryDto, toOwnerDto } from '@/src/application/use-cases/_mappers'

export interface SearchInputDto {
  readonly query: string
}

type SearchError = InvalidInputError | NotFoundError | RateLimitError | InternalError

/**
 * Implements the search auto-detect algorithm (DEVELOPMENT_PLAN.md §4.2):
 *
 * 1. Validate input — must be non-empty and contain only `[A-Za-z0-9._/-]`.
 * 2. If input matches `^[\w.-]+/[\w.-]+$` → treat as `owner/repo` and fetch the repo.
 *    - 404 → NotFoundError
 *    - Success → kind `repo-detail`
 * 3. Otherwise, attempt `/users/{input}`:
 *    - 200 → kind `owner-repos` (owner + their repos + other repos named like the
 *            query, so a repo never gets hidden behind a same-named account)
 *    - 404 → fall through to step 4
 * 4. Repo-name search → kind `repo-list`. Empty `items` is NOT an error —
 *    callers render the empty state.
 */
export class SearchUseCase {
  constructor(private readonly githubRepo: IGithubRepository) {}

  async execute(input: SearchInputDto): Promise<Result<SearchResultDto, SearchError>> {
    // Step 1 — validate
    const query = input.query.trim()

    if (query.length === 0) {
      return err(new InvalidInputError('Search query must not be empty.'))
    }

    if (!/^[A-Za-z0-9._/\-]+$/.test(query)) {
      return err(
        new InvalidInputError(
          'Search query contains invalid characters. Only letters, digits, dots, hyphens, underscores, and forward slashes are allowed.',
        ),
      )
    }

    // Step 2 — owner/repo pattern (exactly one slash, word chars + dots + hyphens on each side)
    if (/^[\w.-]+\/[\w.-]+$/.test(query)) {
      return this.searchByFullName(query)
    }

    // Step 3 — attempt user/org lookup
    return this.searchByUserOrName(query)
  }

  // -------------------------------------------------------------------------

  private async searchByFullName(query: string): Promise<Result<SearchResultDto, SearchError>> {
    const slashIndex = query.indexOf('/')
    const owner = query.substring(0, slashIndex)
    const repo = query.substring(slashIndex + 1)

    try {
      const repository = await this.githubRepo.getRepositoryByFullName(owner, repo)

      if (repository === null) {
        return err(new NotFoundError(query))
      }

      return ok({ kind: 'repo-detail', repository: toRepositoryDto(repository) })
    } catch (cause) {
      if (cause instanceof RateLimitError) return err(cause)
      console.error('[SearchUseCase] getRepositoryByFullName error', cause)
      return err(new InternalError())
    }
  }

  private async searchByUserOrName(query: string): Promise<Result<SearchResultDto, SearchError>> {
    try {
      // Step 3 — try user/org
      const owner = await this.githubRepo.getUserOrOrg(query)

      if (owner !== null) {
        const [repos, nameMatches] = await Promise.all([
          this.githubRepo.getRepositoriesByUser(query),
          this.githubRepo.searchRepositoriesByName(query),
        ])
        const ownedIds = new Set(repos.map((r) => r.id))
        return ok({
          kind: 'owner-repos',
          owner: toOwnerDto(owner),
          repositories: repos.map(toRepositoryDto),
          nameMatches: nameMatches
            .filter((r) => !ownedIds.has(r.id))
            .map(toRepositoryDto),
        })
      }
    } catch (cause) {
      if (cause instanceof RateLimitError) return err(cause)
      console.error('[SearchUseCase] getUserOrOrg/getRepositoriesByUser error', cause)
      return err(new InternalError())
    }

    // Step 4 — repo name search
    try {
      const repos = await this.githubRepo.searchRepositoriesByName(query)
      return ok({ kind: 'repo-list', repositories: repos.map(toRepositoryDto) })
    } catch (cause) {
      if (cause instanceof RateLimitError) return err(cause)
      console.error('[SearchUseCase] searchRepositoriesByName error', cause)
      return err(new InternalError())
    }
  }
}
