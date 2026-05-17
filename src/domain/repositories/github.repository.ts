import type { GithubRepository } from '@/src/domain/entities/repository.entity'
import type { GithubOwner, OwnerType } from '@/src/domain/entities/owner.entity'

/**
 * Port interface for GitHub data access.
 * Defined in the domain layer; implemented in the infrastructure layer.
 *
 * Methods that might not find a resource return `null` (caller converts to NotFoundError).
 * Methods that hit rate limits or encounter infra errors throw — callers (use cases) catch
 * and convert to Result errors.
 */
export interface IGithubRepository {
  /**
   * Returns the total count of repositories for a language that have >10k stars.
   * Used to compute language popularity rankings.
   */
  getLanguageRepoCount(language: string): Promise<number>

  /**
   * Returns the most-starred repositories across all languages (all-time top list).
   */
  getTopRepositories(): Promise<GithubRepository[]>

  /**
   * Returns recently-created repositories ranked by stars.
   * @param sinceDate ISO-8601 date string (e.g. "2025-05-09")
   */
  getTrendingRepositories(sinceDate: string): Promise<GithubRepository[]>

  /**
   * Fetches a single repository by owner/repo slug.
   * Returns null if the repository does not exist (404).
   */
  getRepositoryByFullName(owner: string, repo: string): Promise<GithubRepository | null>

  /**
   * Fetches a GitHub user or organisation profile.
   * Returns null if the user/org does not exist (404).
   */
  getUserOrOrg(name: string): Promise<GithubOwner | null>

  /**
   * Returns repositories belonging to a user or organisation, sorted by stars.
   * @param ownerType determines whether to use `user:` or `org:` qualifier in the search query
   */
  getRepositoriesByUser(username: string, ownerType: OwnerType): Promise<GithubRepository[]>

  /**
   * Searches repositories by name/keyword.
   * Returns an empty array when no results are found.
   */
  searchRepositoriesByName(query: string): Promise<GithubRepository[]>
}
