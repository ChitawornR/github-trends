import type { IGithubRepository } from '@/src/domain/repositories/github.repository'
import type { GithubRepository } from '@/src/domain/entities/repository.entity'
import type { GithubOwner } from '@/src/domain/entities/owner.entity'
import type {
  RawLanguageCountResponse,
  RawSearchRepositoriesResponse,
  RawRepository,
  RawUser,
} from '@/src/infrastructure/github/github.types'
import { GithubApiClient, isNotFound } from '@/src/infrastructure/github/github-api.client'
import { GithubMapper } from '@/src/infrastructure/github/github.mapper'
import { REVALIDATE, PER_PAGE } from '@/src/infrastructure/github/github.config'

/**
 * Concrete implementation of `IGithubRepository` backed by the GitHub REST API.
 *
 * Error contract:
 * - Methods return `null` where the spec says "not found" (callers convert to domain errors).
 * - `RateLimitError` is re-thrown — use cases catch it and wrap into `Result`.
 * - All other unexpected errors propagate as generic `Error` instances — use cases catch
 *   those too and wrap into `InternalError`.
 */
export class GithubRepositoryImpl implements IGithubRepository {
  constructor(private readonly client: GithubApiClient) {}

  // ---------------------------------------------------------------------------
  // Language stats
  // ---------------------------------------------------------------------------

  async getLanguageRepoCount(language: string): Promise<number> {
    const encodedLang = encodeURIComponent(language)
    const path = `/search/repositories?q=language:${encodedLang}+stars:>10000&per_page=1`
    const response = await this.client.get<RawLanguageCountResponse>(path, REVALIDATE.DASHBOARD)
    return response.total_count
  }

  // ---------------------------------------------------------------------------
  // Top repositories
  // ---------------------------------------------------------------------------

  async getTopRepositories(): Promise<GithubRepository[]> {
    const path = `/search/repositories?q=stars:>50000&sort=stars&order=desc&per_page=${PER_PAGE.TOP_REPOS}`
    const response = await this.client.get<RawSearchRepositoriesResponse>(
      path,
      REVALIDATE.DASHBOARD,
    )
    return response.items.map(GithubMapper.toRepository)
  }

  // ---------------------------------------------------------------------------
  // Trending repositories
  // ---------------------------------------------------------------------------

  async getTrendingRepositories(sinceDate: string): Promise<GithubRepository[]> {
    const path = `/search/repositories?q=created:>${sinceDate}&sort=stars&order=desc&per_page=${PER_PAGE.TRENDING_REPOS}`
    const response = await this.client.get<RawSearchRepositoriesResponse>(
      path,
      REVALIDATE.DASHBOARD,
    )
    return response.items.map(GithubMapper.toRepository)
  }

  // ---------------------------------------------------------------------------
  // Full repo lookup (owner/repo)
  // ---------------------------------------------------------------------------

  async getRepositoryByFullName(owner: string, repo: string): Promise<GithubRepository | null> {
    const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
    const result = await this.client.get<RawRepository>(path, REVALIDATE.SEARCH)

    if (isNotFound(result)) {
      return null
    }

    return GithubMapper.toRepository(result)
  }

  // ---------------------------------------------------------------------------
  // User / org lookup
  // ---------------------------------------------------------------------------

  async getUserOrOrg(name: string): Promise<GithubOwner | null> {
    const path = `/users/${encodeURIComponent(name)}`
    const result = await this.client.get<RawUser>(path, REVALIDATE.SEARCH)

    if (isNotFound(result)) {
      return null
    }

    return GithubMapper.toOwnerFromRawUser(result)
  }

  async getRepositoriesByUser(username: string): Promise<GithubRepository[]> {
    const encodedUser = encodeURIComponent(username)
    const path = `/search/repositories?q=user:${encodedUser}&sort=stars&order=desc&per_page=${PER_PAGE.USER_REPOS}`
    const response = await this.client.get<RawSearchRepositoriesResponse>(
      path,
      REVALIDATE.SEARCH,
    )
    return response.items.map(GithubMapper.toRepository)
  }

  // ---------------------------------------------------------------------------
  // Repo-name search
  // ---------------------------------------------------------------------------

  async searchRepositoriesByName(query: string): Promise<GithubRepository[]> {
    const encodedQuery = encodeURIComponent(query)
    const path = `/search/repositories?q=${encodedQuery}+in:name&sort=stars&order=desc&per_page=${PER_PAGE.SEARCH_REPOS}`
    const response = await this.client.get<RawSearchRepositoriesResponse>(
      path,
      REVALIDATE.SEARCH,
    )
    return response.items.map(GithubMapper.toRepository)
  }
}
